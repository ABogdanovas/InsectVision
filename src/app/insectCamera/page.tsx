import {useResizePlugin} from 'vision-camera-resize-plugin';
import {Stack} from '../../components';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {useTensorflowModel} from 'react-native-fast-tflite';

import {useEffect, useRef, useState} from 'react';
import {Button, Text} from 'react-native-paper';
import {useLinkTo} from '../../../charon';
import {
  LayoutChangeEvent,
  LayoutRectangle,
  Platform,
  StyleSheet,
} from 'react-native';
import {Worklets} from 'react-native-worklets-core';
import Animated, {useAnimatedStyle, withTiming} from 'react-native-reanimated';
import {Dimensions} from 'react-native';

const MODEL_SIZE = 480;

export default function CameraPage() {
  const objectDetection = useTensorflowModel(
    require('../../ml/model.tflite'),
    Platform.OS === 'android' ? 'android-gpu' : 'core-ml',
  );
  const model =
    objectDetection.state === 'loaded' ? objectDetection.model : undefined;
  const {resize} = useResizePlugin();

  const [insect, setInsect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    classId: number;
  } | null>(null);

  const cameraLayout = useRef<LayoutRectangle>();

  const handleCameraLayout = ({nativeEvent}: LayoutChangeEvent) => {
    cameraLayout.current = nativeEvent.layout;
  };

  const calculateInsect = Worklets.createRunOnJS(
    (
      newInsect: {
        x: number;
        y: number;
        maxX: number;
        maxY: number;
        width: number;
        height: number;
        classId: number;
        frameHeight: number;
        frameWidth: number;
      } | null,
    ) => {
      const {width: screenWidth, height: screenHeight} =
        Dimensions.get('screen');
      const MODEL_SIZE = 480;

      if (!newInsect) {
        setInsect(null);
        return;
      }

      if (!cameraLayout.current) {
        return;
      }

      const frameHeight = newInsect.frameHeight;
      const frameWidth = newInsect.frameWidth;

      // what model sees
      const modelMinX = newInsect.x * MODEL_SIZE;
      const modelMinY = newInsect.y * MODEL_SIZE;
      const modelMaxX = newInsect.maxX * MODEL_SIZE;
      const modelMaxY = newInsect.maxY * MODEL_SIZE;

      const rotatedModelX = MODEL_SIZE - modelMaxY;
      const rotatedModelY = modelMinX;

      const rotatedWidth = modelMaxY - modelMinY;
      const rotatedHeight = modelMaxX - modelMinX;

      const scaleX = frameHeight / MODEL_SIZE;
      const scaleY = frameWidth / MODEL_SIZE;

      const scale = Math.min(scaleX, scaleY);

      // console.log('scaleX', scaleX);
      // console.log('scaleY', scaleY);

      const unnormilizedX = rotatedModelX * scaleX;
      const unnormilizedY = rotatedModelY * scaleY;
      const unnormilizedWidth = rotatedWidth * scale;
      const unnormilizedHeight = rotatedHeight * scale;

      // console.log('unnormilizedX', unnormilizedX);
      // console.log('unnormilizedY', unnormilizedY);
      // console.log('unnormilizedWidth', unnormilizedWidth);
      // console.log('unnormilizedHeight', unnormilizedHeight);

      const finalScaleX = screenWidth / frameWidth;
      const finalScaleY = screenHeight / frameHeight;

      const finalScale = Math.max(
        finalScaleX,
        finalScaleY,
        Platform.select({ios: -1000, android: 1, default: NaN}),
      );

      const upscaledWidth = frameWidth * finalScale;
      const upscaledHeight = frameHeight * finalScale;

      const offsetX = (screenWidth - upscaledWidth) / 2;
      const offsetY = (screenHeight - upscaledHeight) / 2;

      console.log(
        JSON.stringify({
          x: unnormilizedX * finalScale + offsetY,
          y: unnormilizedY * finalScale + offsetX,
          width: unnormilizedWidth * finalScale,
          height: frameHeight * finalScale,
          classId: newInsect.classId,
        }),
      );

      setInsect({
        x: unnormilizedX * finalScale + offsetY,
        y: unnormilizedY * finalScale + offsetX,
        width: unnormilizedWidth * finalScale,
        height: frameHeight * finalScale,
        classId: newInsect.classId,
      });
    },
  );

  const frameP = useFrameProcessor(
    frame => {
      'worklet';

      if (model == null) {
        return;
      }

      try {
        const resized = resize(frame, {
          scale: {width: MODEL_SIZE, height: MODEL_SIZE},
          pixelFormat: 'rgb',
          dataType: 'float32',
        });

        const outputs = model.runSync([resized]);
        const tensor = outputs[0];

        const frameWidth = frame.width;
        const frameHeight = frame.height;

        const stride = 6;
        const numDetections = tensor.length / stride;

        for (let i = 0; i < 1; i++) {
          const offset = i * stride;

          const x1 = Number(tensor[offset + 0]);
          const y1 = Number(tensor[offset + 1]);
          const x2 = Number(tensor[offset + 2]);
          const y2 = Number(tensor[offset + 3]);

          const score = tensor[offset + 4];
          const classId = tensor[offset + 5];

          if (score > 0.5) {
            calculateInsect({
              height: y2 - y1,
              width: x2 - x1,
              x: x1,
              y: y1,
              maxX: x2,
              maxY: y2,
              classId: Number(classId),
              frameHeight: frameHeight,
              frameWidth: frameWidth,
            });
          } else {
            calculateInsect(null);
          }

          console.log(classId);
        }
      } catch (err) {
        console.error('❌ Ошибка в frameProcessor:', err);
      }
    },
    [model],
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      borderWidth: 2,
      borderColor: 'yellow',
      position: 'absolute',

      top: withTiming(insect?.y ?? 0, {duration: 100}),
      left: withTiming(insect?.x ?? 0, {duration: 100}),
      width: withTiming(insect?.width ?? 0, {duration: 100}),
      height: withTiming(insect?.height ?? 0, {duration: 100}),
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    };
  });

  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  });

  const linkTo = useLinkTo();

  if (!hasPermission) {
    return (
      <Stack style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Allow permission</Text>
      </Stack>
    );
  }
  if (device == null) {
    return (
      <Stack style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>No camera dete</Text>
        <Button
          style={{backgroundColor: '#daa'}}
          onPress={() => {
            linkTo('/home');
          }}>
          dawda
        </Button>
      </Stack>
    );
  }
  return (
    <Stack style={{flex: 1}}>
      <Camera
        pixelFormat="rgb"
        device={device}
        fps={24}
        onLayout={handleCameraLayout}
        frameProcessor={frameP}
        isActive
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <Animated.View style={animatedStyle} />
    </Stack>
  );
}

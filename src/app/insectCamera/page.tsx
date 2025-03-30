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
import {Platform, StyleSheet} from 'react-native';
import {Worklets} from 'react-native-worklets-core';
import Animated, {useAnimatedStyle, withTiming} from 'react-native-reanimated';
import {Dimensions} from 'react-native';
import insectClasses from '../../ml/classes.json';

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

  const dismissInsectCounter = useRef(0);

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
      const dimension = Dimensions.get('screen');
      const MODEL_SIZE = 480;

      if (!newInsect) {
        setInsect(null);
        return;
      }

      const frameHeight = newInsect.frameWidth;
      const frameWidth = newInsect.frameHeight;

      const width = newInsect.maxX - newInsect.x;

      const height = newInsect.maxY - newInsect.y;

      const cropOffsetY = MODEL_SIZE * 1.77 - MODEL_SIZE;

      const scale = Math.min(frameHeight / MODEL_SIZE, frameWidth / MODEL_SIZE);

      const scaledX = newInsect.x * MODEL_SIZE * scale;
      const scaledY = (newInsect.y * MODEL_SIZE + cropOffsetY / 2) * scale;
      const scaledWidth = width * MODEL_SIZE * scale;
      const scaledHeight = height * MODEL_SIZE * scale;

      const cameraScaleX = dimension.width / frameWidth;
      const cameraScaleY = dimension.height / frameHeight;

      const cameraScale = Math.max(cameraScaleX, cameraScaleY);

      const upslacesWidth = frameWidth * cameraScale;
      const upslacesHeight = frameHeight * cameraScale;

      const offsetX = (dimension.width - upslacesWidth) / 2;
      const offsetY = (dimension.height - upslacesHeight) / 2;

      setInsect({
        x: scaledX * cameraScale + offsetX,
        y: scaledY * cameraScale + offsetY,
        width: scaledWidth * cameraScale,
        height: scaledHeight * cameraScale,
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
          rotation: '90deg',
        });

        const outputs = model.runSync([resized]);
        const tensor = outputs[0];

        const frameWidth = frame.width;
        const frameHeight = frame.height;

        const stride = 6;
        // const numDetections = tensor.length / stride;

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
            if (dismissInsectCounter.current > 5) {
              dismissInsectCounter.current = 0;
              calculateInsect(null);
            } else {
              dismissInsectCounter.current++;
            }
          }
        }
      } catch (err) {
        console.error('❌ Error in frameProcessor:', err);
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
      borderTopRightRadius: 12,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
    };
  });

  const animatedTextContainer = useAnimatedStyle(() => {
    return {
      backgroundColor: 'yellow',
      position: 'absolute',
      paddingHorizontal: 6,
      paddingVertical: 2,
      overflow: 'hidden',
      borderTopLeftRadius: 6,
      borderTopRightRadius: 6,

      top: withTiming(insect?.y ? insect?.y - 24 : 0, {duration: 100}),
      left: withTiming(insect?.x ? insect.x : 0, {duration: 100}),
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
        enableZoomGesture
        pixelFormat="rgb"
        device={device}
        frameProcessor={frameP}
        isActive
        focusable
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <Animated.View pointerEvents="none" style={animatedTextContainer}>
        <Text
          style={{
            color: 'black',
            fontSize: 18,
          }}>
          {insect?.classId && insectClasses[insect.classId]}
        </Text>
      </Animated.View>
      <Animated.View style={animatedStyle} />
    </Stack>
  );
}

import {useResizePlugin} from 'vision-camera-resize-plugin';
import {Stack} from '../../components';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {useTensorflowModel} from 'react-native-fast-tflite';
import RNFetchBlob from 'react-native-blob-util';
import {useCallback, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Button, IconButton, Text} from 'react-native-paper';
import {useLinkTo} from '../../../charon';
import {
  Linking,
  Platform,
  Pressable,
  PressableProps,
  StyleSheet,
  View,
} from 'react-native';
import {Worklets} from 'react-native-worklets-core';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {Dimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {globalStorage} from '../../../globalStorage';
import {ScanHistory} from '../../beans/ScanHistory';
import {getML} from '../../services/getML';
import {t} from 'i18next';

const MODEL_SIZE = 480;

export default function CameraPage() {
  const {top, bottom} = useSafeAreaInsets();

  const {goBack} = useNavigation();

  const [insectClasses, setInsectClasses] = useState<
    {
      name: string;
      isDanger: boolean;
    }[]
  >([]);

  const [isClassesLoading, setIsClassesLoading] = useState(true);

  const getMLCallback = useCallback(async () => {
    //TODO add download model according to location

    const paths_ml = await getML(true);

    const indexes = await RNFetchBlob.fs.readFile(paths_ml!.indexes, 'utf8');

    setInsectClasses(JSON.parse(indexes));
    setIsClassesLoading(false);
  }, []);

  useEffect(() => {
    getMLCallback();
  }, [getMLCallback]);

  //FIXME library cannot open tflite files directly from phone storage
  const objectDetection = useTensorflowModel(
    require('../../ml/model.tflite'),
    Platform.OS === 'android' ? 'default' : 'core-ml',
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

      if (!newInsect) {
        setInsect(null);
        return;
      }

      const frameHeight = newInsect.frameWidth;
      const frameWidth = newInsect.frameHeight;

      const width = newInsect.maxX - newInsect.x;

      const height = newInsect.maxY - newInsect.y;

      const cropOffsetY =
        (MODEL_SIZE * newInsect.frameWidth) / newInsect.frameHeight -
        MODEL_SIZE;

      const scale = Math.min(frameHeight / MODEL_SIZE, frameWidth / MODEL_SIZE);

      const scaledX = newInsect.x * MODEL_SIZE * scale;
      const scaledY = (newInsect.y * MODEL_SIZE + cropOffsetY / 2) * scale;
      const scaledWidth = width * MODEL_SIZE * scale;
      const scaledHeight = height * MODEL_SIZE * scale;

      const cameraScaleX = dimension.width / frameWidth;
      const cameraScaleY = dimension.height / frameHeight;

      const cameraScale = Math.max(cameraScaleX, cameraScaleY);

      const upscaledWidth = frameWidth * cameraScale;
      const upscaledHeight = frameHeight * cameraScale;

      const offsetX = (dimension.width - upscaledWidth) / 2;
      const offsetY = (dimension.height - upscaledHeight) / 2;

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

      if (!model) {
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
      borderColor: interpolateColor(
        insect && insectClasses[insect.classId].isDanger ? 1 : 0,
        [1, 0],
        ['red', 'yellow'],
      ),
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
      backgroundColor: interpolateColor(
        insect && insectClasses[insect.classId].isDanger ? 1 : 0,
        [1, 0],
        ['red', 'yellow'],
      ),

      position: 'absolute',
      paddingHorizontal: 6,
      paddingVertical: 2,
      overflow: 'hidden',
      borderTopLeftRadius: 6,
      borderTopRightRadius: 6,
      opacity: withTiming(insect ? 1 : 0, {duration: 100}),

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

  const camera = useRef<Camera>(null);

  const scanInsect = useCallback(async () => {
    if (!insect) {
      return;
    }

    try {
      const photo = await camera.current?.takePhoto();

      const fileName = photo?.path.split('/').pop();

      await RNFetchBlob.fs.cp(
        `${photo?.path.replace('file://', '')}`,
        RNFetchBlob.fs.dirs.DocumentDir + '/' + fileName,
      );

      const oldHistory = JSON.parse(
        globalStorage.getString('scanHistory') ?? '[]',
      ) as ScanHistory[];

      const currentDate = new Date();

      const newHistory: ScanHistory[] = [
        {
          insectId: insect?.classId ?? 0,
          imagePath: `file://${RNFetchBlob.fs.dirs.DocumentDir}/${fileName}`,
          date: currentDate.toISOString(),
          name: insectClasses[insect.classId].name,
        },
        ...oldHistory,
      ];
      globalStorage.set('scanHistory', JSON.stringify(newHistory));

      linkTo(`/insect/${insect?.classId! + 38 + 1}`);
    } catch (e) {
      console.log('Error in scan history:', e);
    }
  }, [insect, insectClasses, linkTo]);

  if (!hasPermission) {
    return (
      <Stack
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 24,
        }}>
        <Text>{t('allowPermission')}</Text>
        <View style={{flexDirection: 'row', gap: 8}}>
          <Button onPress={goBack}>{t('back')}</Button>
          <Button
            mode="contained"
            onPress={() => {
              Linking.openSettings();
            }}>
            {t('allowPermission')}
          </Button>
        </View>
      </Stack>
    );
  }
  if (
    device === null ||
    (insectClasses.length === 0 && !isClassesLoading) ||
    objectDetection.state === 'error'
  ) {
    return (
      <Stack style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text variant="displayLarge">Error</Text>
        <Button
          labelStyle={{color: 'white'}}
          style={{backgroundColor: 'red'}}
          onPress={goBack}>
          Go back
        </Button>
      </Stack>
    );
  }

  if (objectDetection.state === 'loading' || isClassesLoading) {
    return (
      <Stack style={{flex: 1}}>
        <Camera
          device={device}
          isActive
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <IconButton
          icon="arrow-left"
          mode="contained"
          onPress={goBack}
          style={{position: 'absolute', top: top + 8, left: 8, zIndex: 10}}
        />
        <MakePhotoButton
          disabled
          style={{
            position: 'absolute',
            bottom: bottom + 32,
            left: Dimensions.get('window').width / 2 - 64 / 2,
            zIndex: 5,
            height: 64,
            width: 64,
          }}
        />
        <View
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            backgroundColor: 'black',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.9,
            zIndex: 5,
          }}>
          <ActivityIndicator size="large" />
        </View>
      </Stack>
    );
  }

  return (
    <Stack style={{flex: 1}}>
      <Camera
        ref={camera}
        photo
        enableZoomGesture
        pixelFormat="rgb"
        device={device}
        frameProcessor={frameP}
        isActive
        focusable
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <IconButton
        icon="arrow-left"
        mode="contained"
        onPress={goBack}
        style={{position: 'absolute', top: top + 8, left: 8}}
      />
      <Animated.View pointerEvents="none" style={animatedTextContainer}>
        <Text
          style={{
            color:
              insect && insectClasses[insect.classId].isDanger
                ? 'white'
                : 'black',
            fontSize: 18,
          }}>
          {insect &&
            insectClasses[insect.classId].name[0].toUpperCase() +
              insectClasses[insect.classId].name.slice(1)}
        </Text>
      </Animated.View>
      <Animated.View style={animatedStyle} />
      <MakePhotoButton
        disabled={!insect}
        onPress={scanInsect}
        style={{
          position: 'absolute',
          bottom: bottom + 32,
          left: Dimensions.get('window').width / 2 - 64 / 2,
          zIndex: 10,
          height: 64,
          width: 64,
        }}
      />
    </Stack>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type MakePhotoButtonProps = {
  disabled?: boolean;
} & PressableProps;

const MakePhotoButton = ({
  disabled,
  onPressIn,
  onPressOut,
  style,
  ...others
}: MakePhotoButtonProps) => {
  const [pressed, setPressed] = useState(false);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(disabled ? 0.5 : 1, {duration: 300}),
      borderRadius: 100000,
      borderColor: 'white',
      borderWidth: 3,
      flex: 1,
    };
  });

  const animatedInnierViewStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: 'white',
      margin: 3,
      flex: 1,
      borderRadius: 100000,
      transform: [{scale: withTiming(pressed ? 0.9 : 1, {duration: 100})}],
    };
  });

  return (
    <AnimatedPressable
      testID={'make-photo-button'}
      disabled={disabled}
      style={[animatedContainerStyle, style]}
      onPressIn={e => {
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={e => {
        setPressed(false);
        onPressOut?.(e);
      }}
      {...others}>
      <Animated.View pointerEvents="box-none" style={animatedInnierViewStyle} />
    </AnimatedPressable>
  );
};

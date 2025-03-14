import {useResizePlugin} from 'vision-camera-resize-plugin';
import {Stack} from '../../components';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useSkiaFrameProcessor,
} from 'react-native-vision-camera';
import {useTensorflowModel} from 'react-native-fast-tflite';

import {Skia, PaintStyle} from '@shopify/react-native-skia';
import {useEffect} from 'react';
import {Button, Text} from 'react-native-paper';
import {useLinkTo} from '../../../charon';
import {StyleSheet} from 'react-native';

import label from '../../ml/labelmap.json';

export default function CameraPage() {
  const objectDetection = useTensorflowModel(require('../../ml/model.tflite'));
  const model =
    objectDetection.state === 'loaded' ? objectDetection.model : undefined;
  const {resize} = useResizePlugin();
  const frameProcessor = useSkiaFrameProcessor(
    frame => {
      'worklet';
      if (model == null) {
        return;
      }
      const resized = resize(frame, {
        scale: {
          width: 320,
          height: 320,
        },
        pixelFormat: 'rgb',
        dataType: 'uint8',
      });
      frame.render();

      const outputs = model.runSync([resized]);

      const height = frame.height;
      const width = frame.width;

      const detection_boxes = outputs[0];

      for (let i = 0; i < detection_boxes.length; i += 4) {
        if (outputs[2][i / 4] < 0.5) {
          continue;
        }

        const minX = Number(detection_boxes[i]) * height;

        const maxX = Number(detection_boxes[i + 2]) * height;

        const minY = Number(detection_boxes[i + 1]) * width;
        const maxY = Number(detection_boxes[i + 3]) * width;

        const w = maxX - minX;
        const h = maxY - minY;

        // const x = Number(detection_boxes[i + 1]) * width;
        // const y = Number(detection_boxes[i]) * height;

        // const w =
        //   (Number(detection_boxes[i + 3]) - Number(detection_boxes[i + 1])) *
        //   width;
        // const h =
        //   (Number(detection_boxes[i + 2]) - Number(detection_boxes[i])) *
        //   height;

        const rect = Skia.RRectXY(
          {
            x: minX,
            y: minY,
            height: h,
            width: w,
          },
          24,
          24,
        );
        const paint = Skia.Paint();
        paint.setStyle(PaintStyle.Stroke);
        paint.setColor(Skia.Color('yellow'));
        paint.setStrokeWidth(2);
        paint.setAntiAlias(true);

        frame.drawRRect(rect, paint);
      }
    },
    [model],
  );

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
        fps={10}
        device={device}
        frameProcessor={frameProcessor}
        isActive
        style={StyleSheet.absoluteFill}
      />
    </Stack>
  );
}

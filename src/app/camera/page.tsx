import {useResizePlugin} from 'vision-camera-resize-plugin';
import {Stack} from '../../components';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useSkiaFrameProcessor,
} from 'react-native-vision-camera';
import {useTensorflowModel} from 'react-native-fast-tflite';

import {Skia} from '@shopify/react-native-skia';
import {useEffect} from 'react';
import {Text} from 'react-native-paper';

export default function CameraPage() {
  const objectDetection = useTensorflowModel(require('../../ml/model.tflite'));
  const model =
    objectDetection.state === 'loaded' ? objectDetection.model : undefined;

  const {resize} = useResizePlugin();

  const frameProcessor = useSkiaFrameProcessor(
    frame => {
      'worklet';
      if (model == null) return;

      // 1. Resize 4k Frame to 192x192x3 using vision-camera-resize-plugin
      const resized = resize(frame, {
        scale: {
          width: 192,
          height: 192,
        },
        pixelFormat: 'rgb',
        dataType: 'uint8',
      });

      // 2. Run model with given input buffer synchronously
      const outputs = model.runSync([resized]);

      // 3. Interpret outputs accordingly
      const detection_boxes = outputs[0];
      const detection_classes = outputs[1];
      const detection_scores = outputs[2];
      const num_detections = outputs[3];
      console.log(`Detected ${num_detections[0]} objects!`);

      for (let i = 0; i < detection_boxes.length; i += 4) {
        const confidence = detection_scores[i / 4];
        if (confidence > 0.7) {
          // 4. Draw a red box around the detected object!
          const left = detection_boxes[i];
          const top = detection_boxes[i + 1];
          const right = detection_boxes[i + 2];
          const bottom = detection_boxes[i + 3];

          const rect = Skia.XYWHRect(
            Number(left),
            Number(top),
            Number(right) - Number(left),
            Number(bottom) - Number(top),
          );

          const paint = Skia.Paint();
          paint.setColor(Skia.Color('yellow'));
          frame.drawRect(rect, paint);
        }
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
        <Text>No camera detected</Text>
      </Stack>
    );
  }

  return (
    <Stack>
      <Camera device={device} isActive frameProcessor={frameProcessor} />
    </Stack>
  );
}

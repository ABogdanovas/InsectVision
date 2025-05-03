import {Appbar, Text, Divider} from 'react-native-paper';
import {AnimatedPressable, Stack} from '../../../components';
import {t} from 'i18next';
import dayjs from 'dayjs';
import {Canvas, useSVG, ImageSVG} from '@shopify/react-native-skia';

import {Dimensions, FlatList, ListRenderItemInfo, View} from 'react-native';
import {globalStorage} from '../../../../index';
import {ScanHistory} from '../../../beans/ScanHistory';
import {useEffect, useRef, useState} from 'react';
import ImageModal, {ReactNativeImageModal} from 'react-native-image-modal';

const IMAGE_SIZE = Dimensions.get('window').width * 0.8;

export default function HistoryPage() {
  const svg = useSVG(require('../../../../assets/noDataV2.svg'));

  const [data, setData] = useState<ScanHistory[]>(
    JSON.parse(globalStorage.getString('scanHistory') ?? '[]') as ScanHistory[],
  );

  useEffect(() => {
    const listener = globalStorage.addOnValueChangedListener(key => {
      if (key === 'scanHistory') {
        setData(
          JSON.parse(
            globalStorage.getString('scanHistory') ?? '[]',
          ) as ScanHistory[],
        );
      }

      if (key === 'language') {
        dayjs.locale(globalStorage.getString('language') ?? 'en');
      }
    });

    return () => listener.remove();
  });

  return (
    <Stack style={{flex: 1}}>
      <Appbar.Header elevated>
        <Appbar.Content title={t('scanHistory')} />
      </Appbar.Header>

      <FlatList
        data={data}
        ItemSeparatorComponent={Divider}
        renderItem={item => <RenderItem {...item} />}
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 48,
            }}>
            <View style={{width: IMAGE_SIZE, height: IMAGE_SIZE}}>
              <Canvas
                style={{
                  flex: 1,
                }}>
                {svg && (
                  <ImageSVG svg={svg} width={IMAGE_SIZE} height={IMAGE_SIZE} />
                )}
              </Canvas>
            </View>
            <Text variant="headlineSmall">{t('noDataFound')}</Text>
            <Text style={{textAlign: 'center'}}>
              {t('noDataFoundDescription')}
            </Text>
          </View>
        }
      />
    </Stack>
  );
}

const RenderItem = ({item}: ListRenderItemInfo<ScanHistory>) => {
  const ref = useRef<ReactNativeImageModal>(null);

  return (
    <AnimatedPressable
      onPress={() => {
        ref.current?.open();
      }}>
      <View
        style={{
          gap: 8,
          padding: 16,
          flexDirection: 'row',
        }}>
        <View>
          <ImageModal
            ref={ref}
            resizeMode="cover"
            modalImageResizeMode="cover"
            source={{
              uri: item.imagePath,
            }}
            style={{
              width: 156,
              height: 156,
              borderRadius: 8,
            }}
          />
        </View>
        <View style={{gap: 4}}>
          <Text variant="titleLarge">
            {item.name[0].toLocaleUpperCase() + item.name.slice(1)}
          </Text>
          <Text>{dayjs(item.date).format('YYYY-MM-DD HH:mm')}</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
};

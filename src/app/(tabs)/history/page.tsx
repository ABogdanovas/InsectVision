import {Appbar, Text} from 'react-native-paper';
import {Stack} from '../../../components';
import {t} from 'i18next';

import {Canvas, useSVG, ImageSVG} from '@shopify/react-native-skia';

import {Dimensions, FlatList, View} from 'react-native';

const IMAGE_SIZE = Dimensions.get('window').width * 0.8;

export default function HistoryPage() {
  const svg = useSVG(require('../../../../assets/noDataV2.svg'));

  return (
    <Stack style={{flex: 1}}>
      <Appbar.Header elevated>
        <Appbar.Content title={t('scanHistory')} />
      </Appbar.Header>

      <FlatList
        data={[]}
        renderItem={() => {
          return <View></View>;
        }}
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

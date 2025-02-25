import {Appbar, Searchbar, Text} from 'react-native-paper';
import {Stack} from '../../../components';
import {t} from 'i18next';
import {View} from 'react-native';

export default function HomePage() {
  return (
    <Stack>
      <Appbar.Header elevated>
        <Appbar.Content title={t('insects')} />
      </Appbar.Header>
      <View style={{width: '100%', height: '100%', paddingHorizontal: 16}}>
        <Searchbar placeholder="Search" style={{marginVertical: 8}} />
        <Text>home</Text>
      </View>
    </Stack>
  );
}

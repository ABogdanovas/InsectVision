import {Appbar, Searchbar, Text} from 'react-native-paper';
import {AnimatedPressable, Loading, Stack} from '../../../components';
import {t} from 'i18next';
import {FlatList, View} from 'react-native';
import {useCategories} from '../../../services/useCategories';
import {Category} from '../../../beans/Category';
import {Insect} from '../../../beans/Insect';
import {useInsects} from '../../../services/useInsects';
import FastImage from '@d11/react-native-fast-image';
import {useState} from 'react';
import {useLinkTo} from '../../../../charon';

const StickySearchbar = () => {
  return (
    <Searchbar
      icon="magnify"
      value=""
      placeholder="Search"
      style={{marginTop: 8, marginHorizontal: 16}}
    />
  );
};

export default function HomePage() {
  const {data} = useCategories();

  return (
    <Stack style={{flex: 1}}>
      <Appbar.Header elevated>
        <Appbar.Content title={t('insects')} />
      </Appbar.Header>
      <FlatList
        contentContainerStyle={{gap: 8}}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={StickySearchbar}
        data={data}
        renderItem={({item}) => {
          return <InsectsList {...item} />;
        }}
      />
    </Stack>
  );
}

const InsectListItem = (item: Insect) => {
  const [loading, setLoading] = useState(true);

  const linkTo = useLinkTo();

  return (
    <View>
      <View
        style={{width: 156, height: 156, borderRadius: 12, overflow: 'hidden'}}>
        <AnimatedPressable
          onPress={() => {
            linkTo(`/insect/${item.id}`);
          }}
          style={{width: 156}}>
          <FastImage
            fallback
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            source={{
              uri: item.photo_url,
              cache: FastImage.cacheControl.cacheOnly,
            }}
            style={{width: 156, height: 156}}
          />
          {loading && (
            <Loading
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
              }}
            />
          )}
        </AnimatedPressable>
      </View>
      <Text variant="bodyMedium">{item.name}</Text>
    </View>
  );
};

const InsectsList = (item: Category) => {
  const {data, isLoading} = useInsects({category_id: item.id});

  return (
    <View style={{gap: 4}}>
      <Text variant="titleLarge" style={{paddingHorizontal: 16}}>
        {item.name}
      </Text>

      <FlatList
        contentContainerStyle={{paddingHorizontal: 16, gap: 16}}
        showsHorizontalScrollIndicator={false}
        horizontal
        data={
          isLoading
            ? Array.from({length: 5}).map(
                () =>
                  ({
                    category_id: 1,
                    danger_description: '',
                    description: '',
                    habitat: '',
                    id: 1,
                    is_danger: false,
                    location: '',
                    name: '',
                    photo_url: '',
                  } as Insect),
              )
            : data
        }
        renderItem={({item: _item}) =>
          isLoading ? <LoadingInsectItem /> : <InsectListItem {..._item} />
        }
        keyExtractor={(_item, index) =>
          _item.id.toString() + '_' + index.toString()
        }
      />
    </View>
  );
};

const LoadingInsectItem = () => {
  return (
    <View style={{gap: 4}}>
      <Loading style={{width: 156, height: 156, borderRadius: 12}} />
      <Loading style={{width: 120, height: 16, borderRadius: 8}} />
    </View>
  );
};

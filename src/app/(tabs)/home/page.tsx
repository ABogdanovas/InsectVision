import {Appbar, Searchbar, Text} from 'react-native-paper';
import {AnimatedPressable, Loading, Stack} from '../../../components';
import {t} from 'i18next';
import {FlatList, Platform, View} from 'react-native';
import {useCategories} from '../../../services/useCategories';
import {Category} from '../../../beans/Category';
import {Insect} from '../../../beans/Insect';
import {useInsects} from '../../../services/useInsects';
import FastImage from '@d11/react-native-fast-image';
import {useState} from 'react';
import {useLinkTo} from '../../../../charon';
import {FilterModal} from './FilterModal';
import {FilterCategories} from '../../../beans/FilterCategories';
import {useDebounce} from 'use-debounce';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';
import {FlashList} from '@shopify/flash-list';

const StickySearchbar = ({
  onFilterPress,
  value,
  onChangeText,
}: {
  onFilterPress: () => void;
  value: string;
  onChangeText: (text: string) => void;
}) => {
  return (
    <Searchbar
      icon="magnify"
      value={value}
      onChangeText={onChangeText}
      placeholder="Search"
      style={{marginTop: 8, marginHorizontal: 16}}
      traileringIcon="filter-variant"
      onTraileringIconPress={onFilterPress}
      clearIcon="close"
    />
  );
};

const layoutAnimation = LinearTransition.springify().damping(80).stiffness(200);

export default function HomePage() {
  const {data, isLoading} = useCategories();

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const [filterCategories, setFilterCategories] = useState<
    {type: FilterCategories; isSelected: boolean}[]
  >([
    {type: FilterCategories.isBiting, isSelected: false},
    {type: FilterCategories.isDanger, isSelected: false},
    {type: FilterCategories.isEndangered, isSelected: false},
    {type: FilterCategories.isFlying, isSelected: false},
    {type: FilterCategories.isParasite, isSelected: false},
    {type: FilterCategories.isPoisonous, isSelected: false},
  ]);

  const structuredFilterCategories = filterCategories.reduce(
    (acc, curr) => {
      return {
        ...acc,
        [curr.type]: curr.isSelected,
      };
    },
    {} as {
      isDanger: boolean;
      isBiting: boolean;
      isEndangered: boolean;
      isFlying: boolean;
      isParasite: boolean;
      isPoisonous: boolean;
    },
  );

  return (
    <Stack style={{flex: 1}}>
      <Appbar.Header elevated>
        <Appbar.Content title={t('insects')} />
      </Appbar.Header>
      <Animated.FlatList
        itemLayoutAnimation={
          Platform.OS === 'ios' ? layoutAnimation : undefined
        }
        keyExtractor={(item, index) =>
          item.id.toString() + '_' + index.toString()
        }
        contentContainerStyle={{gap: 8}}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={StickySearchbar({
          onChangeText: setSearchQuery,
          value: searchQuery,
          onFilterPress: () => {
            setIsFilterModalVisible(true);
          },
        })}
        data={
          isLoading
            ? Array.from({length: 6}).map(
                () =>
                  ({
                    id: 1,
                    name: '',
                    photo_urls: [''],
                    description: '',
                  } as Category),
              )
            : data
        }
        renderItem={({item}) => {
          return isLoading ? (
            <Animated.View exiting={FadeOut}>
              <LoadingCategoryItem />
            </Animated.View>
          ) : (
            <Animated.View entering={FadeIn}>
              <InsectsList
                isLoading={isLoading}
                searchQuery={debouncedSearchQuery[0]}
                item={item}
                filterCategories={structuredFilterCategories}
              />
            </Animated.View>
          );
        }}
      />

      <FilterModal
        items={filterCategories}
        setItems={setFilterCategories}
        visible={isFilterModalVisible}
        onDismiss={() => {
          setIsFilterModalVisible(false);
        }}
      />
    </Stack>
  );
}

const InsectListItem = (item: Insect) => {
  const [loading, setLoading] = useState(true);

  const linkTo = useLinkTo();

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut}>
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
              uri: item.photo_urls[0],
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
    </Animated.View>
  );
};

const FlashListSeparator = () => {
  return <View style={{width: 16}} />;
};

const InsectsList = ({
  item,
  filterCategories,
  searchQuery = '',
}: {
  isLoading?: boolean;
  item: Category;
  searchQuery?: string;
  filterCategories: {
    isDanger: boolean;
    isBiting: boolean;
    isEndangered: boolean;
    isFlying: boolean;
    isParasite: boolean;
    isPoisonous: boolean;
  };
}) => {
  const {data, isLoading, fetchNextPage} = useInsects({
    category_id: item.id,
    filterCategories: filterCategories,
    searchQuery: searchQuery,
  });

  if (!isLoading && data === undefined) {
    return null;
  }

  const insects = data ? data.pages.flatMap(page => page) : [];

  if (insects.length === 0) {
    return null;
  }

  return (
    <View style={{gap: 4}}>
      <Text variant="titleLarge" style={{paddingHorizontal: 16}}>
        {item.name}
      </Text>

      <FlashList
        onEndReached={() => {
          fetchNextPage();
        }}
        estimatedItemSize={156 + 16}
        contentContainerStyle={{paddingHorizontal: 16}}
        showsHorizontalScrollIndicator={false}
        horizontal
        ItemSeparatorComponent={FlashListSeparator}
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
                    photo_urls: [''],
                    is_biting: false,
                    is_endangered: false,
                    is_flying: false,
                    is_parasite: false,
                    is_poisonous: false,
                  } as Insect),
              )
            : insects
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

const LoadingCategoryItem = () => {
  return (
    <View style={{gap: 4}}>
      <Loading
        style={{width: 156, height: 24, borderRadius: 10, marginLeft: 16}}
      />
      <FlatList
        showsHorizontalScrollIndicator={false}
        horizontal
        contentContainerStyle={{paddingHorizontal: 16, gap: 16}}
        data={Array.from({length: 5})}
        keyExtractor={(_, index) => index.toString()}
        renderItem={() => <LoadingInsectItem />}
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

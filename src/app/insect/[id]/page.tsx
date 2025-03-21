import {
  Button,
  Card,
  Chip,
  IconButton,
  Snackbar,
  Text,
} from 'react-native-paper';
import {AssistantFAB, Stack} from '../../../components';
import {useNavigation} from '@react-navigation/native';
import {useLinkTo, useParams} from '../../../../charon';
import {useInsect} from '../../../services/useInsect';
import {useRef, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Dimensions, Linking, Platform, ScrollView, View} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import {PERMISSIONS, request} from 'react-native-permissions';
import {InsectCard} from './InsectCard';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {t} from 'i18next';

import ImageModal from 'react-native-image-modal';
import {Insect} from '../../../beans/Insect';

const HEADER_OFFSET = 20;

const HEADER_MAX_HEIGHT = 240;

const initialLocation = (locations: Insect['locations']) => {
  if (locations) {
    let minLat = locations[0].latitude;
    let maxLat = locations[0].latitude;
    let minLng = locations[0].longitude;
    let maxLng = locations[0].longitude;

    if (locations.length === 1) {
      return {
        latitude: locations[0].latitude,
        longitude: locations[0].longitude,
        latitudeDelta: 100,
        longitudeDelta: 100,
      };
    }

    locations.forEach(loc => {
      minLat = Math.min(minLat, loc.latitude);
      maxLat = Math.max(maxLat, loc.latitude);
      minLng = Math.min(minLng, loc.longitude);
      maxLng = Math.max(maxLng, loc.longitude);
    });

    const latitude = (minLat + maxLat) / 2;
    const longitude = (minLng + maxLng) / 2;
    const latitudeDelta = (maxLat - minLat) * 1.3; // add padding or default value
    const longitudeDelta = (maxLng - minLng) * 1.3; // add padding or default value

    return {
      latitude,
      longitude,
      latitudeDelta,
      longitudeDelta,
    };
  }

  // Default region if no locations
  return {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };
};

export default function InsectPage() {
  const {goBack} = useNavigation();

  const {id} = useParams();

  const {data} = useInsect({id: Number(id)});

  const {top} = useSafeAreaInsets();

  const linkTo = useLinkTo();

  const {bottom} = useSafeAreaInsets();

  const mapRef = useRef<MapView>(null);

  const [findingPestsControl, setFindingPestsControl] = useState(false);

  const findPestsControl = async () => {
    const res = await request(
      Platform.select({
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        default: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      }),
      {
        title: t('locationPermissionTitle'),
        message: t('locationPermissionDescription'),
        buttonPositive: 'Ok',
      },
    );

    if (res === 'blocked') {
      setSnackbarVisible(true);
      return;
    }

    if (res === 'granted') {
      await new Promise(resolve => {
        Geolocation.getCurrentPosition(
          position => {
            const {latitude, longitude} = position.coords;
            const url = `https://www.google.com/maps/search/insect+control/@${latitude},${longitude},14z`;
            Linking.canOpenURL(url)
              .then(supported => {
                if (supported) {
                  Linking.openURL(url);
                } else {
                  console.error('Cannot open link', url);
                }
              })
              .catch(err => console.error('Failed to open link', err))
              .finally(() => resolve(null));
          },
          error => {
            console.error('Cannot set location', error);
            resolve(null);
          },
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
      });
    }
  };

  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const offsetY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: e => (offsetY.value = e.contentOffset.y),
  });

  const animatedImageContainerStyle = useAnimatedStyle(() => {
    const slowGrowth = (x: number, maxOffset: number): number => {
      const k = -Math.log(0.3) / (2 * maxOffset);
      return (maxOffset - 1) * (1 - Math.exp(-k * x));
    };

    const offset = slowGrowth(Math.abs(offsetY.value), HEADER_OFFSET);

    return {
      transform: [
        {
          translateY:
            offsetY.value < 0
              ? offsetY.value - HEADER_OFFSET + offset
              : -HEADER_OFFSET,
        },
      ],
    };
  });

  return (
    <Stack style={{height: '100%'}}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={{flex: 1}}
        contentContainerStyle={{
          gap: 12,
          paddingBottom: bottom + 16 + 48, // To prevent the FAB from overlapping the content
        }}>
        <Animated.View
          style={[
            animatedImageContainerStyle,
            {
              overflow: 'hidden',
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
              marginBottom: -HEADER_OFFSET,
            },
          ]}>
          <ImageModal
            isTranslucent
            style={{
              width: Dimensions.get('window').width,
              height: HEADER_MAX_HEIGHT,
            }}
            resizeMode="cover"
            modalImageResizeMode="contain"
            source={{
              uri: data?.photo_urls[0],
            }}
          />
        </Animated.View>
        <Text variant="displaySmall" style={{paddingHorizontal: 16}}>
          {data?.name}
        </Text>
        <ScrollView
          horizontal
          contentContainerStyle={{paddingHorizontal: 16, gap: 4}}>
          {data?.is_danger && (
            <Chip
              selectedColor="#fff"
              style={{backgroundColor: data?.is_danger && '#f94449'}}
              pointerEvents="none">
              {t('isDanger')}
            </Chip>
          )}
          {data?.is_flying && <Chip pointerEvents="none">{t('isFlying')}</Chip>}
          {data?.is_biting && <Chip pointerEvents="none">{t('isBiting')}</Chip>}
          {data?.is_endangered && (
            <Chip pointerEvents="none">{t('isEndangered')}</Chip>
          )}
          {data?.is_parasite && (
            <Chip pointerEvents="none">{t('isParasite')}</Chip>
          )}
          {data?.is_poisonous && (
            <Chip pointerEvents="none">{t('isPoisonous')}</Chip>
          )}
        </ScrollView>
        <View style={{gap: 12, paddingHorizontal: 16}}>
          <InsectCard title={t('description')}>
            <Text>{data?.description}</Text>
          </InsectCard>
          <InsectCard title={t('dangerDescription')}>
            <Text>{data?.danger_description}</Text>
          </InsectCard>
          <Card>
            <Card.Title title={t('location')} />
            <Card.Content style={{marginBottom: 8}}>
              <Text>
                {data?.locations &&
                  data.locations.map(location => location.name).join(', ')}
              </Text>
            </Card.Content>

            <View
              style={{
                borderTopStartRadius: 16,
                borderTopEndRadius: 16,
                borderBottomStartRadius: 12,
                borderBottomEndRadius: 12,
                overflow: 'hidden',
              }}>
              <MapView
                initialRegion={initialLocation(data.locations)}
                ref={mapRef}
                provider="google"
                style={{width: '100%', height: 400}}>
                {data?.locations &&
                  data.locations.map(location => (
                    <Marker
                      key={location.id}
                      coordinate={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                      }}
                    />
                  ))}
              </MapView>
            </View>
          </Card>
          <InsectCard title={t('habitat')}>
            <Text>{data?.habitat}</Text>
          </InsectCard>
          <Button
            loading={findingPestsControl}
            onPress={async () => {
              setFindingPestsControl(true);
              findPestsControl().finally(() => setFindingPestsControl(false));
            }}
            mode="contained">
            {t('findControl')}
          </Button>
        </View>
      </Animated.ScrollView>
      <IconButton
        onPress={goBack}
        mode="contained"
        style={{
          position: 'absolute',
          top: top,
          left: 16,
          zIndex: 10,
        }}
        icon="arrow-left"
      />
      <Snackbar
        action={{
          label: 'Settings',
          onPress: () => {
            Linking.openSettings();
          },
        }}
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}>
        {t('locationPermissionError')}
      </Snackbar>
      <AssistantFAB
        isVisible={!snackbarVisible}
        onPress={() => {
          linkTo('/assistant');
        }}
        style={{
          position: 'absolute',
          bottom: bottom + 16,
          right: 16,
        }}
      />
    </Stack>
  );
}

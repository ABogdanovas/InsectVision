import {
  Button,
  Card,
  Chip,
  IconButton,
  Snackbar,
  Text,
} from 'react-native-paper';
import {AssistantFAB, Loading, Stack} from '../../../components';
import {useNavigation} from '@react-navigation/native';
import {useLinkTo, useParams} from '../../../../charon';
import {useInsect} from '../../../services/useInsect';
import {useEffect, useRef, useState} from 'react';
import FastImage from '@d11/react-native-fast-image';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Linking, Platform, ScrollView, View} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import {PERMISSIONS, request} from 'react-native-permissions';
import {InsectCard} from './InsectCard';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

const HEADER_OFFSET = 20;

const HEADER_MAX_HEIGHT = 260;

const MIN_LATITUDE_DELTA = 30;
const MIN_LONGITUDE_DELTA = 30;

const AnimatedImage = Animated.createAnimatedComponent(FastImage);

export default function InsectPage() {
  const {goBack} = useNavigation();

  const {id} = useParams();

  const {data} = useInsect({id: Number(id)});

  const [loading, setLoading] = useState(true);

  const {top} = useSafeAreaInsets();

  const linkTo = useLinkTo();

  const {bottom} = useSafeAreaInsets();

  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (mapRef.current && data?.locations && data?.locations.length > 0) {
      const latitudes = data?.locations.map(m => m.latitude);
      const longitudes = data?.locations.map(m => m.longitude);
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);

      const midLat = (minLat + maxLat) / 2;
      const midLng = (minLng + maxLng) / 2;

      let latitudeDelta = maxLat - minLat;
      let longitudeDelta = maxLng - minLng;

      if (latitudeDelta < MIN_LATITUDE_DELTA) {
        latitudeDelta = MIN_LATITUDE_DELTA;
      }
      if (longitudeDelta < MIN_LONGITUDE_DELTA) {
        longitudeDelta = MIN_LONGITUDE_DELTA;
      }

      mapRef.current.animateToRegion(
        {
          latitude: midLat,
          longitude: midLng,
          latitudeDelta: latitudeDelta * 2,
          longitudeDelta: longitudeDelta * 2,
        },
        500,
      );
    }
  }, [data]);

  const findPestsControl = async () => {
    const res = await request(
      Platform.select({
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        default: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      }),
      {
        title: 'Location permission needed',
        message: 'We need your location to find the nearest insect control',
        buttonPositive: 'OK',
      },
    );

    if (res === 'blocked') {
      setSnackbarVisible(true);
      return;
    }

    if (res === 'granted') {
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
            .catch(err => console.error('Failed to open link', err));
        },
        error => {
          console.error('Cannot set location', error);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
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

  const animatedImageStyle = useAnimatedStyle(() => {
    const imageScaler = (x: number, alpha: number = 0.1): number => {
      return 1.1 - 0.1 / Math.pow(1 + x, alpha);
    };

    const scale = imageScaler(Math.abs(offsetY.value));

    return {
      transform: [
        {
          scaleY: offsetY.value < 0 ? scale : 1,
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
          <AnimatedImage
            fallback
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            source={{
              uri: data?.photo_urls[0],
              cache: FastImage.cacheControl.cacheOnly,
            }}
            style={[
              {
                height: HEADER_MAX_HEIGHT,
                width: '100%',
              },
              animatedImageStyle,
            ]}
          />
          {loading && (
            <Loading
              style={{
                position: 'absolute',
                width: '100%',
                height: HEADER_MAX_HEIGHT,
              }}
            />
          )}
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
              Danger
            </Chip>
          )}
          {data?.is_flying && <Chip pointerEvents="none">Flying</Chip>}
          {data?.is_biting && <Chip pointerEvents="none">Can bite</Chip>}
          {data?.is_endangered && <Chip pointerEvents="none">Endangered</Chip>}
          {data?.is_parasite && <Chip pointerEvents="none">Parasite</Chip>}
          {data?.is_poisonous && <Chip pointerEvents="none">Poisonous</Chip>}
        </ScrollView>
        <View style={{gap: 12, paddingHorizontal: 16}}>
          <InsectCard title="Description">
            <Text>{data?.description}</Text>
          </InsectCard>
          <InsectCard title="Danger">
            <Text>{data?.danger_description}</Text>
          </InsectCard>
          <Card>
            <Card.Title title="Locations" />
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
                ref={mapRef}
                provider="google"
                style={{width: '100%', height: 400}}
                initialRegion={{
                  latitude: 37.78825,
                  longitude: -122.4324,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}>
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
          <InsectCard title="Habitat">
            <Text>{data?.habitat}</Text>
          </InsectCard>
          <Button onPress={findPestsControl} mode="contained">
            Find insect control
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
        We need your location to find the nearest insect control, please enable
        location permissions in the settings
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

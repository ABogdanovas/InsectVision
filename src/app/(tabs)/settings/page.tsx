import {
  Appbar,
  Divider,
  Icon,
  RadioButton,
  Text,
  useTheme,
} from 'react-native-paper';
import {
  Dimensions,
  FlatList,
  GestureResponderEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import CountryFlag from 'react-native-country-flag';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {useCallback, useEffect, useRef, useState} from 'react';
import Animated, {
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {AnimatedPressable} from '../../../components';
import {globalStorage} from '../../../../globalStorage';
import {DeleteDataModal} from './DeleteDataModal';
import {useSafeContext} from '@sirse-dev/safe-context';
import {MainContext} from '../../MainContext';

import switchTheme from 'react-native-theme-switch-animation';
import {StateLayerProps} from '../../../components/StateLayer/StateLayer';

const availableLanguages = ['en', 'lt'];

const SCREEN_WIDTH = Dimensions.get('screen').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;

const LAYOUT_ANIMATION = LinearTransition.springify()
  .damping(80)
  .stiffness(200);

export default function SettingsPage() {
  const {theme, setTheme} = useSafeContext(MainContext);

  const [bottomSheetIndex, setBottomSheetIndex] = useState<number>(-1);

  const [deleteDataDialogVisible, setDeleteDataDialogVisible] = useState(false);

  const {colors} = useTheme();

  const {t, i18n} = useTranslation();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    setBottomSheetIndex(index);
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheetModalProvider>
        <View style={{flex: 1}}>
          <Appbar.Header elevated>
            <Appbar.Content title={t('settings')} />
          </Appbar.Header>
          <Pressable
            pointerEvents={bottomSheetIndex === 0 ? 'box-only' : 'auto'}
            style={{flex: 1}}
            onPress={() => {
              if (bottomSheetIndex === 0) {
                bottomSheetModalRef.current?.dismiss();
              }
            }}>
            <ScrollView
              contentContainerStyle={{
                flex: 1,
              }}>
              <ListItem
                stateLayerProps={{skipPressOutAnimation: true}}
                onPress={async e => {
                  const cxRation = e.nativeEvent.pageX / SCREEN_WIDTH;
                  const cyRatio = e.nativeEvent.pageY / SCREEN_HEIGHT;

                  switchTheme({
                    switchThemeFunction: () => {
                      globalStorage.set(
                        'theme',
                        theme === 'dark' ? 'light' : 'dark',
                      );
                      setTheme(theme === 'dark' ? 'light' : 'dark');
                    },
                    animationConfig: {
                      type: 'circular',
                      duration: 900,
                      startingPoint: {
                        cxRatio: cxRation,
                        cyRatio: cyRatio,
                      },
                    },
                  });
                }}
                leftComponent={
                  <Icon
                    size={24}
                    source={
                      theme === 'dark' ? 'weather-night' : 'white-balance-sunny'
                    }
                  />
                }
                text={theme === 'dark' ? t('darkMode') : t('lightMode')}
              />
              <ListItem
                onPress={() => {
                  handlePresentModalPress();
                }}
                leftComponent={
                  <CountryFlag
                    style={{borderRadius: 4}}
                    isoCode={i18n.language === 'en' ? 'gb' : i18n.language}
                    size={18}
                  />
                }
                text={t('fullLanguage')}
              />
              <ListItem
                onPress={() => {
                  setDeleteDataDialogVisible(true);
                }}
                leftComponent={<Icon size={24} source="database" />}
                text={t('appData')}
              />
            </ScrollView>
          </Pressable>
        </View>

        <DeleteDataModal
          visible={deleteDataDialogVisible}
          setVisible={value => setDeleteDataDialogVisible(value)}
        />
        <BottomSheetModal
          $modal
          backgroundStyle={{
            backgroundColor: colors.surface,
          }}
          containerStyle={{
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
          handleIndicatorStyle={{
            backgroundColor: colors.onSurface,
          }}
          ref={bottomSheetModalRef}
          onChange={handleSheetChanges}>
          <BottomSheetView
            style={{
              minHeight: 128,
              paddingBottom: 24,
            }}>
            <Text
              style={{paddingHorizontal: 12, paddingVertical: 8}}
              variant="titleLarge">
              {t('selectLanguage')}
            </Text>

            <RadioButton.Group
              value={i18n.language}
              onValueChange={value => {
                globalStorage.set('language', value);
                i18n.changeLanguage(value);
              }}>
              <FlatList
                data={availableLanguages}
                ItemSeparatorComponent={() => <Divider />}
                renderItem={({item}) => (
                  <ListItem
                    onPress={() => {
                      globalStorage.set('language', item);
                      i18n.changeLanguage(item);
                      bottomSheetModalRef.current?.dismiss();
                    }}
                    leftComponent={
                      <CountryFlag
                        style={{borderRadius: 4}}
                        isoCode={item === 'en' ? 'gb' : item}
                        size={18}
                      />
                    }
                    rightComponent={
                      <RadioButtonItem checked={item === i18n.language} />
                    }
                    text={t(`${item}`)}
                  />
                )}
              />
            </RadioButton.Group>
          </BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

type ListItemProps = {
  leftComponent: React.ReactNode;
  rightComponent?: React.ReactNode;
  text: string;
  onPress?: (event: GestureResponderEvent) => void;
  stateLayerProps?: StateLayerProps;
};

const ListItem = ({
  leftComponent: iconComponent,
  text,
  onPress,
  stateLayerProps,
  rightComponent,
}: ListItemProps) => {
  return (
    <AnimatedPressable onPress={onPress} stateLayerProps={stateLayerProps}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingVertical: 12,
          width: '100%',
        }}>
        <Animated.View
          layout={LAYOUT_ANIMATION}
          style={{width: 32, alignItems: 'center'}}>
          {iconComponent}
        </Animated.View>
        <Text variant="titleMedium"> {text}</Text>
        <View
          style={{
            flex: 1,
            alignItems: 'flex-end',
          }}>
          {rightComponent}
        </View>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

type RadioButtonItemProps = {
  checked: boolean;
};

const RadioButtonItem = ({checked}: RadioButtonItemProps) => {
  const {colors} = useTheme();

  const progress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(checked ? 1 : 0);
  }, [checked, progress]);

  const colorStyle = useAnimatedStyle(() => {
    return {
      borderColor: withTiming(checked ? colors.primary : colors.outline),
    };
  });

  const scaleStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: withTiming(checked ? 1 : 0, {duration: 150})}],
      opacity: withTiming(checked ? 1 : 0, {duration: 150}),
    };
  });

  return (
    <Animated.View
      style={[
        colorStyle,
        {
          borderRadius: 1000,
          borderWidth: 2,
          width: 22,
          height: 22,
        },
      ]}>
      <Animated.View
        style={[
          scaleStyle,
          {
            flex: 1,
            margin: 2,
            backgroundColor: colors.primary,
            borderRadius: 1000,
          },
        ]}
      />
    </Animated.View>
  );
};

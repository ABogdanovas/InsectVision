import {
  Appbar,
  Divider,
  Icon,
  RadioButton,
  Text,
  useTheme,
} from 'react-native-paper';
import {
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {useSafeContext} from '@sirse-dev/safe-context';
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
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {AnimatedPressable, Stack} from '../../../components';
import {MainContext} from '../../MainContext';
import {globalStorage} from '../../../..';
import {DeleteDataModal} from './DeleteDataModal';

const availableLanguages = ['en', 'lt'];

export default function SettingsPage() {
  const {setTheme, theme, setLanguage} = useSafeContext(MainContext);

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
          <TouchableWithoutFeedback
            onPress={() => {
              if (bottomSheetIndex === 0) {
                bottomSheetModalRef.current?.dismiss();
              }
            }}>
            <Stack
              pointerEvents={bottomSheetIndex === 0 ? 'box-only' : 'auto'}
              style={{
                flex: 1,
              }}>
              <ListItem
                onPress={() => {
                  globalStorage.set(
                    'theme',
                    theme === 'dark' ? 'light' : 'dark',
                  );
                  setTheme(theme === 'dark' ? 'light' : 'dark');
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
                text="Cache"
              />
            </Stack>
          </TouchableWithoutFeedback>
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
              Select language
            </Text>

            <RadioButton.Group
              value={i18n.language}
              onValueChange={value => {
                setLanguage(value);
                i18n.changeLanguage(value);
              }}>
              <FlatList
                data={availableLanguages}
                ItemSeparatorComponent={() => <Divider />}
                renderItem={({item}) => (
                  <ListItem
                    onPress={() => {
                      setLanguage(item);
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
  onPress?: () => void;
};

const ListItem = ({
  leftComponent: iconComponent,
  text,
  onPress,
  rightComponent,
}: ListItemProps) => {
  return (
    <AnimatedPressable onPress={onPress}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingVertical: 12,
          width: '100%',
        }}>
        <View style={{width: 32, alignItems: 'center'}}>{iconComponent}</View>
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

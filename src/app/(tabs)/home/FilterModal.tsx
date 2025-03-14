import {
  Button,
  Modal,
  ModalProps,
  Portal,
  Text,
  useTheme,
} from 'react-native-paper';
import {AnimatedPressable, Icon, Stack} from '../../../components';
import {Dispatch, SetStateAction, useEffect} from 'react';
import Animated, {
  interpolateColor,
  LinearTransition,
  StretchInX,
  StretchOutX,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {View} from 'react-native';
import {FilterCategories} from '../../../beans/FilterCategories';

type ChipProps = {
  selected?: boolean;
  onPress?: () => void;
  title: string;
};

const layoutAnimation = LinearTransition.springify().damping(80).stiffness(200);

const Chip = ({selected, title, onPress}: ChipProps) => {
  const isSelected = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    isSelected.value = withTiming(selected ? 1 : 0);
  }, [isSelected, selected]);

  const {colors} = useTheme();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        isSelected.value,
        [0, 1],
        ['#d3d3d3', colors.primaryContainer],
      ),
    };
  });

  const animatedTextColor = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        isSelected.value,
        [0, 1],
        ['#000', colors.onPrimaryContainer],
      ),
    };
  });

  return (
    <Animated.View layout={layoutAnimation}>
      <AnimatedPressable
        onPress={() => {
          onPress?.();
        }}
        stateLayerProps={{layout: layoutAnimation}}
        style={{borderRadius: 8, overflow: 'hidden'}}>
        <Animated.View
          layout={layoutAnimation}
          style={[
            animatedStyle,
            {
              flexDirection: 'row',
              gap: 8,
              padding: 8,
              borderRadius: 8,
            },
          ]}>
          {selected && (
            <Animated.View
              entering={StretchInX}
              exiting={StretchOutX.duration(200)}>
              <Icon size={16} name="check" />
            </Animated.View>
          )}
          <Animated.Text layout={layoutAnimation} style={animatedTextColor}>
            {title}
          </Animated.Text>
        </Animated.View>
      </AnimatedPressable>
    </Animated.View>
  );
};

export type FilterModalProps = {
  items: {
    type: FilterCategories;
    isSelected: boolean;
  }[];
  setItems: Dispatch<
    SetStateAction<
      {
        type: FilterCategories;
        isSelected: boolean;
      }[]
    >
  >;
} & Omit<ModalProps, 'children'>;

export const FilterModal = ({items, setItems, ...other}: FilterModalProps) => {
  return (
    <Portal>
      <Modal {...other}>
        <Stack
          style={{
            padding: 24,
            marginHorizontal: 24,
            borderRadius: 12,

            gap: 12,
          }}>
          <Text variant="titleLarge">Select by categories</Text>
          <View
            style={{
              gap: 8,
              flexDirection: 'row',
              flexWrap: 'wrap',
            }}>
            {items.map(item => (
              <Chip
                key={item.type}
                selected={item.isSelected}
                onPress={() => {
                  setItems(old => {
                    return old.map(i => {
                      if (i.type === item.type) {
                        return {
                          ...i,
                          isSelected: !i.isSelected,
                        };
                      }
                      return i;
                    });
                  });
                }}
                title={item.type}
              />
            ))}
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingTop: 24,
            }}>
            <Button onPress={other.onDismiss}>Close</Button>
            <Button
              onPress={() => {
                setItems(old => {
                  return old.map(i => {
                    return {
                      ...i,
                      isSelected: false,
                    };
                  });
                });
              }}>
              Reset
            </Button>
          </View>
        </Stack>
      </Modal>
    </Portal>
  );
};

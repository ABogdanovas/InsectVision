import {useSafeContext} from '@sirse-dev/safe-context';
import {StyleProp, StyleSheet, ViewStyle} from 'react-native';
import Animated, {
  BaseAnimationBuilder,
  LayoutAnimationFunction,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {MainContext} from '../../app/MainContext';

export type StateLayerProps = {
  color?: string;
  skipPressOutAnimation?: boolean;
  pressedOpacity?: number;
  pressed?: boolean;
  style?: StyleProp<ViewStyle>;
  layout?:
    | BaseAnimationBuilder
    | LayoutAnimationFunction
    | typeof BaseAnimationBuilder
    | undefined;
};

export const StateLayer = ({
  color,
  pressed = false,
  pressedOpacity = 0.1,
  skipPressOutAnimation,
  style,
  layout,
}: StateLayerProps) => {
  const {theme} = useSafeContext(MainContext);

  if (!color) {
    color = theme === 'dark' ? 'white' : 'black';
  }

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(pressed ? pressedOpacity : 0, {
        duration: !pressed && skipPressOutAnimation ? 0 : 200,
      }),
    };
  });

  return (
    <Animated.View
      style={[animatedStyle, styles.container, {backgroundColor: color}, style]}
      layout={layout}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
});

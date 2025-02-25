import {
  GestureResponderEvent,
  TouchableWithoutFeedbackProps,
  View,
  ViewProps,
} from 'react-native';
import {
  createNavigatorFactory,
  DefaultNavigatorOptions,
  Descriptor,
  NavigationHelpers,
  NavigationProp,
  ParamListBase,
  RouteProp,
  TabActionHelpers,
  TabNavigationState,
  TabRouter,
  TabRouterOptions,
  useNavigationBuilder,
} from '@react-navigation/native';
import {useTheme} from 'react-native-paper';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

export const ScreenWrapper = ({style, ...props}: ViewProps) => {
  return <View style={[{flex: 1}, style]} {...props} />;
};

export const Screen = ({
  style,
  isFocused,
  ...props
}: {isFocused: boolean} & ViewProps) => {
  const {colors} = useTheme();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isFocused ? 1 : 0.85, {duration: 100}),
      //If you will notice some bugs with opacity, you can use this code below
      // opacity: isFocused ? 1 : 0,
      zIndex: isFocused ? 1 : -1,
    };
  });

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          backgroundColor: colors.background,
        },
        style,
      ]}
      {...props}
      aria-hidden={!isFocused}
    />
  );
};

export type Layout = {width: number; height: number};

export type BottomTabNavigationEventMap = {
  tabPress: {data: undefined; canPreventDefault: true};
};

export type BottomTabNavigationHelpers = NavigationHelpers<
  ParamListBase,
  BottomTabNavigationEventMap
> &
  TabActionHelpers<ParamListBase>;

export type BottomTabNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = keyof ParamList,
  NavigatorID extends string | undefined = undefined,
> = NavigationProp<
  ParamList,
  RouteName,
  NavigatorID,
  TabNavigationState<ParamList>,
  BottomTabNavigationOptions,
  BottomTabNavigationEventMap
> &
  TabActionHelpers<ParamList>;

export type BottomTabScreenProps<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = keyof ParamList,
  NavigatorID extends string | undefined = undefined,
> = {
  navigation: BottomTabNavigationProp<ParamList, RouteName, NavigatorID>;
  route: RouteProp<ParamList, RouteName>;
};

export type BottomTabNavigationOptions = {};

export type BottomTabDescriptor = Descriptor<
  BottomTabNavigationOptions,
  BottomTabNavigationProp<ParamListBase>,
  RouteProp<ParamListBase>
>;

export type BottomTabDescriptorMap = Record<string, BottomTabDescriptor>;

export type BottomTabNavigationConfig = {};

export type BottomTabHeaderProps = {
  layout: Layout;

  options: BottomTabNavigationOptions;

  route: RouteProp<ParamListBase>;

  navigation: BottomTabNavigationProp<ParamListBase>;
};

export type BottomTabBarButtonProps = Omit<
  TouchableWithoutFeedbackProps,
  'onPress'
> & {
  href?: string;
  children: React.ReactNode;
  onPress?: (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent> | GestureResponderEvent,
  ) => void;
};

export type BottomTabNavigatorProps = DefaultNavigatorOptions<
  ParamListBase,
  TabNavigationState<ParamListBase>,
  BottomTabNavigationOptions,
  BottomTabNavigationEventMap
> &
  TabRouterOptions &
  BottomTabNavigationConfig;

function BottomTabNavigator({
  id,
  initialRouteName,
  backBehavior,
  children,
  screenListeners,
  screenOptions,
}: BottomTabNavigatorProps) {
  const {state, descriptors, NavigationContent} = useNavigationBuilder<
    TabNavigationState<ParamListBase>,
    TabRouterOptions,
    TabActionHelpers<ParamListBase>,
    BottomTabNavigationOptions,
    BottomTabNavigationEventMap
  >(TabRouter, {
    id,
    initialRouteName,
    backBehavior,
    children,
    screenListeners,
    screenOptions,
  });

  return (
    <NavigationContent>
      <ScreenWrapper>
        {state.routes.map((route, i) => {
          if (state.index !== i) {
            return null;
          }
          return (
            <Screen key={route.key} isFocused={state.index === i}>
              {descriptors[route.key].render()}
            </Screen>
          );
        })}
      </ScreenWrapper>
    </NavigationContent>
  );
}

export const createBottomTabNavigator = createNavigatorFactory<
  TabNavigationState<ParamListBase>,
  BottomTabNavigationOptions,
  BottomTabNavigationEventMap,
  typeof BottomTabNavigator
>(BottomTabNavigator);

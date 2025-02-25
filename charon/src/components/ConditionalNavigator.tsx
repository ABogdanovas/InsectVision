import {StyleSheet, View} from 'react-native';
import {
  createNavigatorFactory,
  DefaultNavigatorOptions,
  ParamListBase,
  StackNavigationState,
  StackRouter,
  useNavigationBuilder,
} from '@react-navigation/native';

export type ConditionalNavigatorProps = DefaultNavigatorOptions<
  ParamListBase,
  StackNavigationState<ParamListBase>,
  {},
  {}
>;

const ConditionalNavigator = ({
  children,
  initialRouteName,
  screenOptions,
}: ConditionalNavigatorProps) => {
  const {state, descriptors, NavigationContent} = useNavigationBuilder(
    StackRouter,
    {
      children,
      screenOptions,
      initialRouteName,
    },
  );

  return (
    <NavigationContent>
      {state.routes.map((route, routeIndex) => (
        <View
          key={route.key}
          style={[
            StyleSheet.absoluteFill,
            {display: routeIndex === state.index ? 'flex' : 'none'},
          ]}>
          {descriptors[route.key].render()}
        </View>
      ))}
    </NavigationContent>
  );
};

export const createConditionalNavigator =
  createNavigatorFactory(ConditionalNavigator);

import {ComponentType, Fragment, Suspense} from 'react';

import {RouteTree} from './getRouteTree';
import {
  createNavigatorFactory,
  DefaultNavigatorOptions,
  ParamListBase,
  StackNavigationState,
  StackRouter,
  useNavigationBuilder,
} from '@react-navigation/native';
import {StyleSheet, View} from 'react-native';

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

const createConditionalNavigator = createNavigatorFactory(ConditionalNavigator);

export const getRouteComponent = (route: RouteTree) => {
  const {
    childPaths,
    LayoutComponent,
    LoadingComponent,
    Navigator,
    navigatorOptions = {},
    PageComponent,
    sortRoutes,
  } = route;

  const childComponents: [name: string, component: ComponentType][] = [];
  let NativeNavigator = Navigator;

  if (childPaths.size > 0) {
    NativeNavigator ??= createConditionalNavigator();

    for (const [name, child] of childPaths) {
      childComponents.push([name, getRouteComponent(child)]);
    }

    if (sortRoutes) {
      childComponents.sort(([a], [b]) => sortRoutes(a, b));
    }
  }

  if (
    process.env.NODE_ENV === 'development' &&
    NativeNavigator &&
    childPaths.size === 0
  ) {
    NativeNavigator = undefined;
  }

  let jsx = NativeNavigator ? (
    <NativeNavigator.Navigator
      initialRouteName="index"
      {...(navigatorOptions as object)}>
      {childComponents.map(
        ([name, Cmp]) =>
          NativeNavigator && (
            <NativeNavigator.Screen name={name} key={name}>
              {props => (
                <Fragment>
                  <Cmp {...(props as React.JSX.IntrinsicAttributes)} />
                </Fragment>
              )}
            </NativeNavigator.Screen>
          ),
      )}
    </NativeNavigator.Navigator>
  ) : (
    <Fragment>{PageComponent && <PageComponent />}</Fragment>
  );

  if (LoadingComponent) {
    jsx = <Suspense fallback={<LoadingComponent />}>{jsx}</Suspense>;
  } else {
    jsx = <Suspense>{jsx}</Suspense>;
  }

  if (LayoutComponent) {
    jsx = <LayoutComponent>{jsx}</LayoutComponent>;
  }

  return function Route() {
    return jsx;
  };
};

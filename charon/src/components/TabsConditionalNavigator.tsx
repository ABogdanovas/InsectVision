import { StyleSheet, View } from 'react-native';
import {
    createNavigatorFactory,
    DefaultNavigatorOptions,
    ParamListBase,
    TabNavigationState,
    TabRouter,
    TabRouterOptions,
    useNavigationBuilder,
} from '@react-navigation/native';

export type TabsConditionalNavigatorProps = DefaultNavigatorOptions<
    ParamListBase,
    TabNavigationState<ParamListBase>,
    {},
    {}
> &
    Pick<TabRouterOptions, 'backBehavior'> & {
        detachInactiveScreens?: boolean;
    };

const TabsConditionalNavigator = ({
    children,
    initialRouteName,
    screenOptions,
    backBehavior = 'history',
    detachInactiveScreens = false,
}: TabsConditionalNavigatorProps) => {
    const { state, descriptors, NavigationContent } = useNavigationBuilder(TabRouter, {
        children,
        screenOptions,
        initialRouteName,
        backBehavior,
    });

    return (
        <NavigationContent>
            {state.routes.map((route, routeIndex) => (
                <View
                    key={route.key}
                    style={[StyleSheet.absoluteFill, { display: routeIndex === state.index ? 'flex' : 'none' }]}
                >
                    {detachInactiveScreens && routeIndex !== state.index ? undefined : descriptors[route.key].render()}
                </View>
            ))}
        </NavigationContent>
    );
};

export const createTabsConditionalNavigator = createNavigatorFactory(TabsConditionalNavigator);

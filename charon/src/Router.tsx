import { Suspense, useEffect, useMemo, useRef } from 'react';
import { DevSettings } from 'react-native';
import {
    LinkingOptions,
    NavigationContainer,
    NavigationContainerProps,
    NavigationProp,
    useNavigation,
    useNavigationContainerRef,
} from '@react-navigation/native';

import { ActiveRouteProvider } from './utils/ActiveRouteContext';
import { getLinkingConfig } from './utils/getLinkingConfig';
import { getRouteComponent } from './utils/getRouteComponent';
import { getRouteTree } from './utils/getRouteTree';
import { RequireContext } from './RequireContext';
import { RouterContextProvider } from './RouterContext';

export type RouterProps = {
    context: RequireContext;
    linking: LinkingOptions<Record<string, unknown>>;
} & NavigationContainerProps;

export const Router = ({ context, linking: additionalLinkingOptions, ...containerProps }: RouterProps) => {
    const routeTree = useMemo(() => getRouteTree(context), [context]);
    const linkingConfig = useMemo(
        () => getLinkingConfig(routeTree, additionalLinkingOptions),
        [routeTree, additionalLinkingOptions],
    );
    const RootRouteComponent = useMemo(() => getRouteComponent(routeTree), [routeTree]);

    const navigationRef = useNavigationContainerRef<Record<string, unknown>>();

    return (
        <RouterContextProvider value={{ tree: routeTree, linking: linkingConfig }}>
            <NavigationContainer ref={navigationRef} {...containerProps} linking={linkingConfig}>
                <ActiveRouteProvider containerRef={navigationRef}>
                    <Suspense>
                        <RootRouteComponent />
                    </Suspense>
                </ActiveRouteProvider>
                {process.env.NODE_ENV === 'development' && <SiteMapDebugAttacher />}
            </NavigationContainer>
        </RouterContextProvider>
    );
};

declare const process: Record<'env', Record<string, string>>;

const SiteMapDebugAttacher = () => {
    const navigation = useNavigation<NavigationProp<Record<string, unknown>>>();
    const navigationRef = useRef(navigation);
    navigationRef.current = navigation;

    useEffect(() => {
        DevSettings.addMenuItem('Show sitemap', () => {
            navigationRef.current.navigate('sitemap.xml');
        });
    }, []);

    return null;
};

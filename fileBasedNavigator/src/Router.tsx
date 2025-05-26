import {Suspense, useMemo} from 'react';
import {
  LinkingOptions,
  NavigationContainer,
  NavigationContainerProps,
  useNavigationContainerRef,
} from '@react-navigation/native';

import {ActiveRouteProvider} from './ActiveRouteContext';
import {getLinkingConfig} from './getLinkingConfig';
import {getRouteComponent} from './getRouteComponent';
import {getRouteTree} from './getRouteTree';
import {RequireContext} from './RequireContext';
import {RouterContextProvider} from './RouterContext';

export type RouterProps = {
  context: RequireContext;
  linking: LinkingOptions<Record<string, unknown>>;
} & NavigationContainerProps;

export const Router = ({
  context,
  linking: additionalLinkingOptions,
  ...containerProps
}: RouterProps) => {
  const routeTree = useMemo(() => getRouteTree(context), [context]);
  const linkingConfig = useMemo(
    () => getLinkingConfig(routeTree, additionalLinkingOptions),
    [routeTree, additionalLinkingOptions],
  );
  const RootRouteComponent = useMemo(
    () => getRouteComponent(routeTree),
    [routeTree],
  );

  const navigationRef = useNavigationContainerRef<Record<string, unknown>>();

  return (
    <RouterContextProvider value={{tree: routeTree, linking: linkingConfig}}>
      <NavigationContainer
        ref={navigationRef}
        {...containerProps}
        linking={linkingConfig}>
        <ActiveRouteProvider containerRef={navigationRef}>
          <Suspense>
            <RootRouteComponent />
          </Suspense>
        </ActiveRouteProvider>
      </NavigationContainer>
    </RouterContextProvider>
  );
};

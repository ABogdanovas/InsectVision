import { LinkingOptions } from '@react-navigation/native';
import { createSafeContext, useSafeContext } from '@sirse-dev/safe-context';

import { RouteTree } from './utils/getRouteTree';

type RouterContextType = {
    tree: RouteTree;
    linking: LinkingOptions<Record<string, unknown>>;
};

const RouterContext = createSafeContext<RouterContextType>();

export const RouterContextProvider = RouterContext.Provider;

export const useRouterContext = () => {
    return useSafeContext(RouterContext);
};

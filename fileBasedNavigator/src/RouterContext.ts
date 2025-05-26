import {LinkingOptions} from '@react-navigation/native';

import {RouteTree} from './getRouteTree';
import {createContext, useContext} from 'react';

type RouterContextType = {
  tree: RouteTree;
  linking: LinkingOptions<Record<string, unknown>>;
};

const RouterContext = createContext<RouterContextType>({});

export const RouterContextProvider = RouterContext.Provider;

export const useRouterContext = () => {
  return useContext(RouterContext);
};

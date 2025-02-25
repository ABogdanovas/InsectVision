import { PropsWithChildren, useEffect, useState } from 'react';
import { NavigationContainerRefWithCurrent, NavigationState, PathConfig } from '@react-navigation/native';
import { createSafeContext, useSafeContext } from '@sirse-dev/safe-context';

import { useParams } from './useParams';
import { useRouterContext } from '../RouterContext';

export type ActiveRouteContextType = {
    routeName: string | undefined;
};

const ActiveRouteContext = createSafeContext<ActiveRouteContextType>();

export type ActiveRouteProviderProps = PropsWithChildren<{
    containerRef: NavigationContainerRefWithCurrent<Record<string, unknown>>;
}>;

type Route = { name: string; state?: NavigationState } & NavigationState;

const getActiveRouteState = function (
    route: Route,
    linking: PathConfig<Record<string, unknown>> | string | undefined,
): string | undefined {
    if (!route) {
        return undefined;
    }

    if (!route.state && (!route.routes || route.routes.length === 0)) {
        const link = (linking as PathConfig<Record<string, unknown>>)?.screens?.[route.name] ?? linking;
        if (typeof link === 'string') {
            return `/${link}`;
        } else {
            return undefined;
        }
    }

    if (typeof linking === 'string' || !linking || !linking.screens) {
        return undefined;
    }

    const nav = 'state' in route ? route.state : route;

    const childActiveRoute = nav?.routes[nav.index] as unknown as Route | undefined;

    if (childActiveRoute === undefined) {
        return undefined;
    }

    const childLinking = linking.screens[childActiveRoute.name];

    if (childLinking === undefined) {
        return undefined;
    }

    return getActiveRouteState(childActiveRoute, childLinking);
};

export const ActiveRouteProvider = ({ containerRef, children }: ActiveRouteProviderProps) => {
    const [activeRoute, setActiveRoute] = useState<string | undefined>();
    const { linking } = useRouterContext();

    useEffect(() => {
        return containerRef.addListener('state', e => {
            if (e.data.state) {
                const activeRoute = getActiveRouteState(
                    containerRef.getRootState() as unknown as Route,
                    linking.config,
                );
                setActiveRoute(activeRoute);
            }
        });
    }, [linking.config, containerRef]);

    return <ActiveRouteContext.Provider value={{ routeName: activeRoute }}>{children}</ActiveRouteContext.Provider>;
};

export const useActiveRoute = () => {
    const params = useParams();

    const { routeName } = useSafeContext(ActiveRouteContext);

    return routeName?.replace(/:\w+/g, val => params[val.slice(1)]);
};

import { useCallback } from 'react';
import { useLinkTo as useNavigationLinkTo } from '@react-navigation/native';

import { useActiveRoute } from './ActiveRouteContext';

export const useLinkTo = () => {
    const activeRoute = useActiveRoute();

    const standardLinkTo = useNavigationLinkTo();

    const linkTo = useCallback(
        (link: string) => {
            if (!activeRoute) {
                return standardLinkTo(link);
            }

            if (link.startsWith('/')) {
                return standardLinkTo(link);
            }

            const routeSegments = activeRoute.split('/');
            const linkSegments = link.split('/').filter(i => i !== '.');

            for (const segment of linkSegments) {
                if (segment === '..') {
                    routeSegments.pop();
                } else {
                    routeSegments.push(segment);
                }
            }

            return standardLinkTo(routeSegments.join('/'));
        },
        [activeRoute, standardLinkTo],
    );

    return linkTo;
};

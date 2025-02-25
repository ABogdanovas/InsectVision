import { LinkingOptions, PathConfigMap } from '@react-navigation/native';

import { RouteTree } from './getRouteTree';

export const getLinkingConfig = (
    tree: RouteTree,
    options: LinkingOptions<Record<string, unknown>>,
): LinkingOptions<Record<string, unknown>> => {
    const screens: Record<string, unknown> = {};

    const queue = [...tree.childPaths.entries()].map(([key, node]) => ({ key, node, screens }));

    while (queue.length > 0) {
        const { key, node, screens } = queue.shift()!;

        if (node.link !== undefined) {
            screens[key] = node.link;
        } else {
            const nestedScreens: Record<string, unknown> = {};
            screens[key] = { screens: nestedScreens };
            queue.push(
                ...[...node.childPaths.entries()].map(([key, node]) => ({
                    key,
                    node,
                    screens: nestedScreens,
                })),
            );
        }
    }

    return {
        ...options,
        config: {
            ...options.config,
            screens: screens as PathConfigMap<Record<string, unknown>>,
        },
    };
};

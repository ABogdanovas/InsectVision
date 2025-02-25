import { ComponentType, PropsWithChildren } from 'react';
import { EventMapBase, NavigationState, ParamListBase, TypedNavigator } from '@react-navigation/native';
import { isAbsolute, parse } from 'path-browserify';

import { SiteMap } from '../components/SiteMap';
import { RequireContext } from '../RequireContext';

type RouteTreeNode = {
    PageComponent?: ComponentType;
    ErrorComponent?: ComponentType<{ error: unknown; reset: () => void }>;
    LoadingComponent?: ComponentType;
    NotFoundComponent?: ComponentType;
    LayoutComponent?: ComponentType<PropsWithChildren<{}>>;
    Navigator?: TypedNavigator<ParamListBase, NavigationState, {}, EventMapBase, ComponentType<unknown>>;
    navigatorOptions?: unknown;
    sortRoutes?: (a: string, b: string) => number;
    childPaths: Map<string, RouteTreeNode>;
    name: string;
    link?: string;
};

export type RouteTree = RouteTreeNode;

const convertRouteToURL = (rawName: string) => {
    // Exclude route groups
    const groupRegex = /^\(\w+\)$/;
    // Rename route segments with params
    const paramRegex = /^\[\w+\]$/;

    const convertedName = rawName
        .split(/\\|\//g)
        .filter(value => value !== '.' && !groupRegex.test(value))
        .map(value => (paramRegex.test(value) ? `:${value.slice(1, -1)}` : value))
        .join('/');

    return convertedName;
};

export const getRouteTree = (context: RequireContext): RouteTree => {
    const keys = context.keys().sort((a, b) => a.length - b.length);

    if (keys.some(isAbsolute)) {
        throw new Error('Fatal error: route construction failed.');
    }

    const possibleNames = ['page', 'layout', 'loading', 'error', 'not-found', 'navigator'];

    const rootNode: RouteTree = {
        childPaths: new Map(),
        name: '/',
    };
    const routes: Map<string, RouteTreeNode> = new Map([['.', rootNode]]);

    for (const key of keys) {
        const { dir: routeName, name } = parse(key);

        if (!possibleNames.includes(name)) {
            continue;
        }

        let route = routes.get(routeName);
        if (!route) {
            route = {
                name: routeName,
                childPaths: new Map(),
            };

            const [, ...segments] = routeName.split('/');
            let currentNode = rootNode;

            let tempRoute = '/';
            while (segments.length > 1) {
                const segment = segments.shift()!;
                tempRoute += `${segment}/`;

                const nextNode = currentNode.childPaths.get(segment);
                if (nextNode) {
                    currentNode = nextNode;
                } else {
                    const newNode = {
                        name: tempRoute,
                        childPaths: new Map(),
                    };
                    currentNode.childPaths.set(segment, newNode);
                    currentNode = newNode;
                }
            }

            const lastSegment = segments.shift()!;

            if (currentNode.childPaths.has(lastSegment)) {
                throw new Error(`Duplicate route names encountered: one of them is "${routeName}"`);
            }

            currentNode.childPaths.set(lastSegment, route);

            routes.set(routeName, route);
        }

        const importedModule = context(key);

        const component = (importedModule as { default: ComponentType<unknown> }).default;
        switch (name) {
            case 'page':
                route.PageComponent = component;
                break;
            case 'layout':
                route.LayoutComponent = component;
                break;
            case 'loading':
                route.LoadingComponent = component;
                break;
            case 'error':
                route.ErrorComponent = component as RouteTreeNode['ErrorComponent'];
                break;
            case 'not-found':
                route.NotFoundComponent = component;
                break;
            case 'navigator':
                route.Navigator = component as unknown as RouteTreeNode['Navigator'];
                route.navigatorOptions = (importedModule as { options: unknown }).options;
                route.sortRoutes = (importedModule as { sortRoutes: (a: string, b: string) => number }).sortRoutes;
                break;
        }
    }

    // Add sitemap route for debugging
    if (process.env.NODE_ENV === 'development') {
        rootNode.childPaths.set('sitemap.xml', {
            name: 'sitemap.xml',
            childPaths: new Map(),
            PageComponent: SiteMap,
        });
    }

    // Traverse root node and search for page routes. Assign correct names for these.
    const traverseQueue: Array<RouteTreeNode> = [rootNode];
    while (traverseQueue.length > 0) {
        const node = traverseQueue.shift()!;

        if (node.PageComponent && node.childPaths.size > 0) {
            const { PageComponent, LoadingComponent } = node;
            traverseQueue.push(...node.childPaths.values());
            node.childPaths.set('index', {
                name: `${node.name}/index`,
                childPaths: new Map(),
                PageComponent,
                LoadingComponent,
                link: convertRouteToURL(node.name),
            });
            node.PageComponent = undefined;
            continue;
        }

        if (node.PageComponent) {
            node.link = convertRouteToURL(node.name);
        }

        traverseQueue.push(...node.childPaths.values());
    }

    return rootNode;
};

declare const process: Record<'env', Record<string, string>>;

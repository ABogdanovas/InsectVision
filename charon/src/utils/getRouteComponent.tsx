import { ComponentType, Fragment, PropsWithChildren, Suspense } from 'react';

import { RouteTree } from './getRouteTree';
import { createConditionalNavigator } from '../components/ConditionalNavigator';
import { ErrorBoundary } from '../components/ErrorBoundary';

const EmptyWrapper = <T extends PropsWithChildren<{}>>({ children }: T) => <Fragment>{children}</Fragment>;

export const getRouteComponent = (route: RouteTree) => {
    const {
        childPaths,
        ErrorComponent,
        LayoutComponent,
        LoadingComponent,
        Navigator,
        navigatorOptions = {},
        PageComponent,
        sortRoutes,
    } = route;

    const childComponents: [name: string, component: ComponentType][] = [];
    let NormalNavigator = Navigator;

    if (childPaths.size > 0) {
        NormalNavigator ??= createConditionalNavigator();

        for (const [name, child] of childPaths) {
            childComponents.push([name, getRouteComponent(child)]);
        }

        if (sortRoutes) {
            childComponents.sort(([a], [b]) => sortRoutes(a, b));
        }
        // TODO: sort child components, according to url nesting
    }

    if (process.env.NODE_ENV === 'development' && NormalNavigator && childPaths.size === 0) {
        // eslint-disable-next-line no-console
        console.error(
            `Looks like you have navigator for ${route.name}, but it doesn't contain any child routes. Do you really need it? This error is only visible in development.`,
        );
        NormalNavigator = undefined;
    }

    const ErrorBoundaryComponent = ErrorComponent ? ErrorBoundary : EmptyWrapper;

    let jsx = NormalNavigator ? (
        <NormalNavigator.Navigator initialRouteName="index" {...(navigatorOptions as object)}>
            {childComponents.map(
                ([name, Cmp]) =>
                    NormalNavigator && (
                        <NormalNavigator.Screen name={name} key={name}>
                            {props => (
                                <ErrorBoundaryComponent FallbackComponent={ErrorComponent!}>
                                    <Cmp {...(props as React.JSX.IntrinsicAttributes)} />
                                </ErrorBoundaryComponent>
                            )}
                        </NormalNavigator.Screen>
                    ),
            )}
        </NormalNavigator.Navigator>
    ) : (
        <ErrorBoundaryComponent FallbackComponent={ErrorComponent!}>
            {PageComponent && <PageComponent />}
        </ErrorBoundaryComponent>
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

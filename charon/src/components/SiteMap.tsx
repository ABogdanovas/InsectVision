import { useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import { useRouterContext } from '../RouterContext';

export const SiteMap = () => {
    const tree = useRouterContext();
    const navigation = useNavigation<NavigationProp<Record<string, unknown>>>();
    const navigationRef = useRef(navigation);
    navigationRef.current = navigation;

    return (
        <View style={styles.containerStyle}>
            <Text style={styles.title}>Sitemap</Text>
            <ScrollView>
                <Text style={styles.content}>
                    {JSON.stringify(
                        tree,
                        (_, value) => {
                            if (typeof value === 'object' && value && value instanceof Map) {
                                return Object.fromEntries(value.entries());
                            }

                            if (typeof value === 'function') {
                                return `Component(${value.name})`;
                            }

                            return value;
                        },
                        4,
                    )}
                </Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 28,
        lineHeight: 36,
        color: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    content: {
        color: '#FFF',
        paddingHorizontal: 16,
    },
    containerStyle: {
        backgroundColor: '#000',
        paddingTop: 16,
        paddingBottom: 64,
    },
});

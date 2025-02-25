import { useMemo } from 'react';
import { useRoute } from '@react-navigation/native';

export const useParams = (): Record<string, string> => {
    const { params } = useRoute();

    const realParams = useMemo(() => {
        let real = (params ?? {}) as Record<string, string>;
        while (real.params !== undefined) {
            real = real.params as unknown as Record<string, string>;
        }

        return real;
    }, [params]);

    return realParams as Record<string, string>;
};

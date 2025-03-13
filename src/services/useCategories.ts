import {useQuery} from '@tanstack/react-query';
import {fetchCategories} from './fetchCategories';
import {useSafeContext} from '@sirse-dev/safe-context';
import {MainContext} from '../app/MainContext';

export const useCategories = () => {
  const {language} = useSafeContext(MainContext);

  return useQuery({
    queryKey: ['categories', language],
    gcTime: 1000 * 60 * 60 * 24 * 14,
    staleTime: 1000 * 60 * 60 * 24 * 14,
    queryFn: async () => {
      return fetchCategories({language: undefined});
    },
  });
};

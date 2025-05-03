import {useQuery} from '@tanstack/react-query';
import {fetchCategories} from './fetchCategories';
import {globalStorage} from '../../globalStorage';

export const useCategories = () => {
  const language = globalStorage.getString('language');

  return useQuery({
    queryKey: ['categories', language],
    gcTime: 1000 * 60 * 60 * 24 * 14,
    staleTime: 1000 * 60 * 60 * 24 * 14,
    queryFn: async () => {
      return fetchCategories({language: undefined});
    },
  });
};

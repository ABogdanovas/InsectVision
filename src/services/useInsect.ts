import {useSuspenseQuery} from '@tanstack/react-query';
import {fetchInsect} from './fetchInsect';
import {globalStorage} from '../../globalStorage';

export const useInsect = ({id}: {id: number}) => {
  const language = globalStorage.getString('language');

  return useSuspenseQuery({
    queryKey: ['insect', id, language],
    gcTime: 1000 * 60 * 60 * 24 * 14,
    staleTime: 1000 * 60 * 60 * 24 * 14,
    queryFn: async () => {
      return fetchInsect({language: undefined, id: id});
    },
  });
};

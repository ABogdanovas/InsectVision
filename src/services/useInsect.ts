import {useQuery} from '@tanstack/react-query';
import {useSafeContext} from '@sirse-dev/safe-context';
import {MainContext} from '../app/MainContext';
import {fetchInsect} from './fetchInsect';

export const useInsect = ({id}: {id: number}) => {
  const {language} = useSafeContext(MainContext);

  return useQuery({
    queryKey: ['insect', id, language],
    gcTime: 1000 * 60 * 60 * 24 * 14,
    staleTime: 1000 * 60 * 60 * 24 * 14,
    queryFn: async () => {
      console.log('refetch');
      return fetchInsect({language: undefined, id: id});
    },
  });
};

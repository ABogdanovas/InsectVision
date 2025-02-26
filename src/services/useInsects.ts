import {useQuery} from '@tanstack/react-query';
import {useSafeContext} from '@sirse-dev/safe-context';
import {MainContext} from '../app/MainContext';
import {fetchInsects} from './fetchInsects';

export const useInsects = ({category_id}: {category_id: number}) => {
  const {language} = useSafeContext(MainContext);

  return useQuery({
    queryKey: ['insects', category_id, language],
    gcTime: 1000 * 60 * 60 * 24 * 14,
    staleTime: 1000 * 60 * 60 * 24 * 14,
    queryFn: async () => {
      console.log('refetch');
      return fetchInsects({language: undefined, category_id: category_id});
    },
  });
};

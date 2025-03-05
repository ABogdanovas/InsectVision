import {useQuery} from '@tanstack/react-query';
import {useSafeContext} from '@sirse-dev/safe-context';
import {MainContext} from '../app/MainContext';
import {fetchInsects} from './fetchInsects';

export const useInsects = ({
  category_id,
  filterCategories,
  searchQuery,
}: {
  category_id: number;
  searchQuery: string;
  filterCategories: {
    isDanger: boolean;
    isBiting: boolean;
    isEndangered: boolean;
    isFlying: boolean;
    isParasite: boolean;
    isPoisonous: boolean;
  };
}) => {
  const {language} = useSafeContext(MainContext);

  return useQuery({
    queryKey: [
      'insects',
      category_id,
      language,
      JSON.stringify(filterCategories),
      searchQuery,
    ],

    gcTime: searchQuery ? 1000 * 60 : 1000 * 60 * 60 * 24 * 14,
    staleTime: searchQuery ? 1000 * 60 : 1000 * 60 * 60 * 24 * 14,
    queryFn: async () => {
      console.log('refetch');
      return fetchInsects({
        searchQuery: searchQuery,
        language: undefined,
        category_id: category_id,
        filterCategories,
      });
    },
  });
};

import {useInfiniteQuery} from '@tanstack/react-query';
import {fetchInsects} from './fetchInsects';
import {globalStorage} from '../..';

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
  const language = globalStorage.getString('language');

  const pageSize = 10;

  return useInfiniteQuery({
    queryKey: [
      'insects',
      category_id,
      language,
      JSON.stringify(filterCategories),
      searchQuery,
    ],
    queryFn: async ({pageParam}) => {
      pageParam;

      return fetchInsects({
        searchQuery: searchQuery,
        language: undefined,
        category_id: category_id,
        filterCategories,
        range: {
          from: pageParam * pageSize,
          to: (pageParam + 1) * pageSize - 1,
        },
      });
    },

    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.length === pageSize ? lastPageParam + 1 : undefined,
    initialPageParam: 0,

    gcTime: searchQuery ? 1000 * 60 : 1000 * 60 * 60 * 24 * 14,
    staleTime: searchQuery ? 1000 * 60 : 1000 * 60 * 60 * 24 * 14,
  });
};

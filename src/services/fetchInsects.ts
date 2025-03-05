import {supabase} from './supabase';
import {Insect, insectSchema} from '../beans/Insect';
import {globalStorage} from '../..';

export const fetchInsects = async ({
  filterCategories,
  category_id,
  language,
  searchQuery,
}: {
  searchQuery: string;
  filterCategories: {
    isDanger: boolean;
    isBiting: boolean;
    isEndangered: boolean;
    isFlying: boolean;
    isParasite: boolean;
    isPoisonous: boolean;
  };
  category_id: number;
  range?: {from: number; to: number};
  language?: 'lt' | 'en';
}): Promise<Insect[]> => {
  const storedLanguage = globalStorage.getString('language') ?? 'en';

  const {error, data} = await supabase
    .rpc('get_insects', {
      p_language: language ?? storedLanguage,
    })
    .filter('category_id', 'eq', category_id)
    .filter(
      'is_danger',
      filterCategories.isDanger ? 'eq' : 'not.is',
      filterCategories.isDanger ? true : null,
    )
    .filter(
      'is_biting',
      filterCategories.isBiting ? 'eq' : 'not.is',
      filterCategories.isBiting ? true : null,
    )
    .filter(
      'is_endangered',
      filterCategories.isEndangered ? 'eq' : 'not.is',
      filterCategories.isEndangered ? true : null,
    )
    .filter(
      'is_flying',
      filterCategories.isFlying ? 'eq' : 'not.is',
      filterCategories.isFlying ? true : null,
    )
    .filter(
      'is_parasite',
      filterCategories.isParasite ? 'eq' : 'not.is',
      filterCategories.isParasite ? true : null,
    )
    .filter(
      'is_poisonous',
      filterCategories.isPoisonous ? 'eq' : 'not.is',
      filterCategories.isPoisonous ? true : null,
    )
    .filter('name', 'ilike', `%${searchQuery}%`);

  if (error) {
    console.log('error', error);
    throw error;
  }

  return insectSchema.array().parse(data);
};

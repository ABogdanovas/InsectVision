import {supabase} from './supabase';
import {Insect, insectSchema} from '../beans/Insect';
import {globalStorage} from '../..';

export const fetchInsects = async ({
  category_id,
  language,
}: {
  category_id: number;
  range?: {from: number; to: number};
  language?: 'lt' | 'en';
}): Promise<Insect[]> => {
  const storedLanguage = globalStorage.getString('language') ?? 'en';

  const {error, data} = await supabase
    .rpc('get_insects', {p_language: language ?? storedLanguage})
    .filter('category_id', 'eq', category_id);

  if (error) {
    console.log('error', error);
    throw error;
  }

  return insectSchema.array().parse(data);
};

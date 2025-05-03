import {supabase} from './supabase';
import {Category, categorySchema} from '../beans/Category';
import {globalStorage} from '../../globalStorage';

export const fetchCategories = async ({
  language,
}: {
  language?: 'en' | 'lt';
}): Promise<Category[]> => {
  const storedLanguage = globalStorage.getString('language') ?? 'en';

  const {data} = await supabase
    .rpc('get_categories', {p_language: language ?? storedLanguage})
    .select('*');

  const validatedData = categorySchema.array().parse(data);

  return validatedData;
};

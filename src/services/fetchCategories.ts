import AsyncStorage from '@react-native-async-storage/async-storage';
import {supabase} from './supabase';
import {Category, categorySchema} from '../beans/Category';

export const fetchCategories = async ({
  language,
}: {
  language?: 'en' | 'lt';
}): Promise<Category[]> => {
  const storedLanguage = (await AsyncStorage.getItem('language')) ?? 'en';

  const {error, data} = await supabase
    .rpc('get_categories', {p_language: language ?? storedLanguage})
    .select('*');

  if (error) {
    console.log('error', error);
    return [];
  }

  const validatedData = categorySchema.array().safeParse(data);

  if (validatedData.success) {
    return validatedData.data;
  }
  console.log('error', validatedData.error);
  return [];
};

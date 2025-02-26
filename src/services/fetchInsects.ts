import AsyncStorage from '@react-native-async-storage/async-storage';
import {supabase} from './supabase';
import {Insect, InsectSchema} from '../beans/Insect';

export const fetchInsects = async ({
  category_id,
  language,
}: {
  category_id: number;
  range?: {from: number; to: number};
  language?: 'lt' | 'en';
}): Promise<Insect[]> => {
  const storedLanguage = (await AsyncStorage.getItem('language')) ?? 'en';

  const {error, data} = await supabase
    .rpc('get_insects', {p_language: language ?? storedLanguage})
    .filter('category_id', 'eq', category_id);

  if (error) {
    console.log('error', error);
    return [];
  }

  const validatedData = InsectSchema.array().safeParse(data);

  if (validatedData.success) {
    return validatedData.data;
  }
  console.log('error', validatedData.error);
  return [];
};

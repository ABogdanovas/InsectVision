import {supabase} from './supabase';
import {Insect, insectSchema} from '../beans/Insect';
import {globalStorage} from '../..';

export const fetchInsect = async ({
  id,
  language,
}: {
  id: number;
  language?: 'lt' | 'en';
}): Promise<Insect> => {
  const storedLanguage = globalStorage.getString('language') ?? 'en';

  const {error, data} = await supabase.rpc('get_insect', {
    p_id: id,
    p_language: language ?? storedLanguage,
  });

  if (error) {
    console.log('error', error);
    throw error;
  }

  return insectSchema.parse(data[0]);
};

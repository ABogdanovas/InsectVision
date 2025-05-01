import ReactNativeBlobUtil from 'react-native-blob-util';
import {globalStorage} from '../../index';
import {supabase} from './supabase';

export const getML = async (isDefault: boolean = true) => {
  try {
    if (isDefault) {
      const lang = globalStorage.getString('language') ?? 'en';

      const ml_path = globalStorage.getString('getPathToModel');
      const indexes_path = globalStorage.getString('getPathToIndexes' + lang);

      if (indexes_path && ml_path) {
        console.log('sa');
        return {
          ml: ml_path,
          indexes: indexes_path,
        };
      }

      const {error, data} = await supabase.rpc('get_model_info', {
        lang: lang,
        isdefault: true,
        loc_id: null,
      });

      if (error) {
        throw new Error(JSON.stringify(error));
      }

      const indexes = data.indexes as string;

      const dirs = ReactNativeBlobUtil.fs.dirs;

      //FIXME library cannot open tflite files directly from phone storage
      //   ReactNativeBlobUtil.config({
      //     // response data will be saved to this path if it has access right.
      //     path: dirs.DocumentDir + '/default.tflite',
      //   })
      //     .fetch('GET', ml)
      //     .then(res => {
      //       globalStorage.set('getPathToModel', res.path());
      //       finalMlPath = res.path();
      //       // the path should be dirs.DocumentDir + 'path-to-file.anything'
      //       console.log('The file saved to ', res.path());
      //     });

      const res = await ReactNativeBlobUtil.config({
        // response data will be saved to this path if it has access right.
        path: dirs.DocumentDir + `/default_${lang}.json`,
      }).fetch('GET', indexes);

      globalStorage.set('getPathToIndexes' + lang, res.path());

      return {
        ml: '',
        indexes: res.path(),
      };
    }
  } catch (e) {
    console.log('Error getting ML', e);
  }

  //TODO GET LOCATION HERE AND RETURN ML ACCORDING TO LOCATION
};

import {AppState} from 'react-native';
import 'react-native-url-polyfill/auto';
import {createClient} from '@supabase/supabase-js';
import {SUPABASE_PROJECT_API_KEY, SUPABASE_PROJECT_URL} from '@env';
import {MMKV} from 'react-native-mmkv';

const supabaseUrl = SUPABASE_PROJECT_URL;
const supabaseAnonKey = SUPABASE_PROJECT_API_KEY;

const supabaseStorage = new MMKV({id: 'supabase'});

const supabaseStorageWrapper = {
  setItem: (key, value) => {
    supabaseStorage.set(key, value);
  },
  getItem: key => {
    const value = supabaseStorage.getString(key);
    return value === undefined ? null : value;
  },
  removeItem: key => {
    supabaseStorage.delete(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: supabaseStorageWrapper,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

AppState.addEventListener('change', state => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

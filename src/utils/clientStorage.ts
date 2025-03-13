import {createSyncStoragePersister} from '@tanstack/query-sync-storage-persister';
import {MMKV} from 'react-native-mmkv';

export const queryCacheStorage = new MMKV({id: 'queryCache'});

const clientStorage = {
  setItem: (key, value) => {
    queryCacheStorage.set(key, value);
  },
  getItem: key => {
    const value = queryCacheStorage.getString(key);
    return value === undefined ? null : value;
  },
  removeItem: key => {
    queryCacheStorage.delete(key);
  },
};

export const clientPersister = createSyncStoragePersister({
  storage: clientStorage,
});

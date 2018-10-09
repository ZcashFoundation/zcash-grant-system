import { PersistConfig } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

export const authPersistConfig: PersistConfig = {
  key: 'auth',
  storage,
  version: 1,
  whitelist: ['token', 'tokenAddress'],
};

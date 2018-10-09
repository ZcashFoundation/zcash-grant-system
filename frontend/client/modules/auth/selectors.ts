import { AppState as S } from 'store/reducers';

export const getAuthToken = (s: S) => s.auth.token;
export const getAuthTokenAddress = (s: S) => s.auth.tokenAddress;

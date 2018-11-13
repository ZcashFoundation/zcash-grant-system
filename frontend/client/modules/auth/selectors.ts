import { AppState as S } from 'store/reducers';

export const getAuthSignature = (s: S) => s.auth.authSignature;
export const getAuthSignatureAddress = (s: S) => s.auth.authSignatureAddress;

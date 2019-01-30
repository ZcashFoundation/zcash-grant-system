import { AppState as S } from 'store/reducers';

export const getIsVerified = (s: S) => !!s.auth.user && s.auth.user.emailVerified;
export const getIsSignedIn = (s: S) => !!s.auth.user;
export const getAuthSignature = (s: S) => s.auth.authSignature;
export const getAuthSignatureAddress = (s: S) => s.auth.authSignatureAddress;

import types from './types';
import usersTypes from 'modules/users/types';
// TODO: Use a common User type instead of this
import { User, AuthSignatureData } from 'types';

export interface AuthState {
  user: User | null;
  isAuthingUser: boolean;
  authUserError: string | null;

  isCheckingUser: boolean;

  isCreatingUser: boolean;
  createUserError: string | null;

  authSignature: AuthSignatureData | null;
  authSignatureAddress: string | null;
  isSigningAuth: boolean;
  signAuthError: string | null;
}

export const INITIAL_STATE: AuthState = {
  user: null,
  isAuthingUser: false,
  authUserError: null,

  isCreatingUser: false,
  createUserError: null,

  isCheckingUser: false,

  authSignature: null,
  authSignatureAddress: null,
  isSigningAuth: false,
  signAuthError: null,
};

export default function createReducer(
  state: AuthState = INITIAL_STATE,
  action: any,
): AuthState {
  switch (action.type) {
    case types.AUTH_USER_PENDING:
      return {
        ...state,
        user: null,
        isAuthingUser: true,
        authUserError: null,
      };
    case types.AUTH_USER_FULFILLED:
      return {
        ...state,
        user: action.payload.user,
        isAuthingUser: false,
      };
    case types.AUTH_USER_REJECTED:
      return {
        ...state,
        isAuthingUser: false,
        authUserError: action.payload,
      };

    case types.CHECK_USER_PENDING:
      return {
        ...state,
        isCheckingUser: true,
      };
    case types.CHECK_USER_FULFILLED:
      return {
        ...state,
        user: action.payload.user,
        isCheckingUser: false,
      };
    case types.CHECK_USER_REJECTED:
      return {
        ...state,
        isCheckingUser: false,
      };

    // update authenticated user when general user updated
    case usersTypes.UPDATE_USER_FULFILLED:
      return {
        ...state,
        user:
          state.user && state.user.userid === action.payload.user.userid
            ? action.payload.user
            : state.user,
      };

    case types.CREATE_USER_PENDING:
      return {
        ...state,
        isCreatingUser: true,
        createUserError: null,
      };
    case types.CREATE_USER_FULFILLED:
      return {
        ...state,
        user: action.payload.user,
        isCreatingUser: false,
      };
    case types.CREATE_USER_REJECTED:
      return {
        ...state,
        isCreatingUser: false,
        createUserError: action.payload,
      };

    case types.SIGN_TOKEN_PENDING:
      return {
        ...state,
        authSignature: null,
        isSigningAuth: true,
        signAuthError: null,
      };
    case types.SIGN_TOKEN_FULFILLED:
      return {
        ...state,
        authSignature: action.payload.authSignature,
        authSignatureAddress: action.payload.address,
        isSigningAuth: false,
      };
    case types.SIGN_TOKEN_REJECTED:
      return {
        ...state,
        isSigningAuth: false,
        signAuthError: action.payload,
      };

    case types.LOGOUT_FULFILLED:
      return {
        ...state,
        user: null,
      };
  }
  return state;
}

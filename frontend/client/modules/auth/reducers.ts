import types from './types';
import usersTypes from 'modules/users/types';
// TODO: Use a common User type instead of this
import { User, AuthSignatureData } from 'types';

export interface AuthState {
  user: User | null;
  isAuthingUser: boolean;
  authUserError: string | null;

  checkedUsers: { [address: string]: User | false };
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

  checkedUsers: {},
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
        authSignature: action.payload.authSignature, // TODO: Make this the real token
        authSignatureAddress: action.payload.user.accountAddress,
        isAuthingUser: false,
      };
    case usersTypes.UPDATE_USER_FULFILLED:
      return {
        ...state,
        user:
          state.user && state.user.accountAddress === action.payload.user.accountAddress
            ? action.payload.user
            : state.user,
      };
    case types.AUTH_USER_REJECTED:
      return {
        ...state,
        isAuthingUser: false,
        authUserError: action.payload,
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
        authSignature: action.payload.authSignature,
        authSignatureAddress: action.payload.user.accountAddress,
        isCreatingUser: false,
        checkedUsers: {
          ...state.checkedUsers,
          [action.payload.user.address]: action.payload.user,
        },
      };
    case types.CREATE_USER_REJECTED:
      return {
        ...state,
        isCreatingUser: false,
        createUserError: action.payload,
      };

    case types.CHECK_USER_PENDING:
      return {
        ...state,
        isCheckingUser: true,
      };
    case types.CHECK_USER_FULFILLED:
      return {
        ...state,
        isCheckingUser: false,
        checkedUsers: action.payload.user
          ? {
              ...state.checkedUsers,
              [action.payload.address]: action.payload.user,
            }
          : {
              ...state.checkedUsers,
              [action.payload.address]: false,
            },
      };
    case types.CHECK_USER_REJECTED:
      return {
        ...state,
        isCheckingUser: false,
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

    case types.LOGOUT:
      return {
        ...state,
        user: null,
        authSignature: null,
        authSignatureAddress: null,
      };
  }
  return state;
}

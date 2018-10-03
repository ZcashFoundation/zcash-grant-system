import types from './types';
// TODO: Use a common User type instead of this
import { TeamMember } from 'modules/create/types';

export interface AuthState {
  user: TeamMember | null;
  isAuthingUser: boolean;
  authUserError: string | null;

  checkedUsers: { [address: string]: TeamMember | false };
  isCheckingUser: boolean;

  isCreatingUser: boolean;
  createUserError: string | null;

  token: string | null;
  tokenAddress: string | null;
  isSigningToken: boolean;
  signTokenError: string | null;
}

export const INITIAL_STATE: AuthState = {
  user: null,
  isAuthingUser: false,
  authUserError: null,

  isCreatingUser: false,
  createUserError: null,

  checkedUsers: {},
  isCheckingUser: false,

  token: null,
  tokenAddress: null,
  isSigningToken: false,
  signTokenError: null,
};

export default function createReducer(state: AuthState = INITIAL_STATE, action: any) {
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
        token: action.payload.token, // TODO: Make this the real token
        tokenAddress: action.payload.user.ethAddress,
        isAuthingUser: false,
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
        token: action.payload.token,
        tokenAddress: action.payload.user.ethAddress,
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
        token: null,
        isSigningToken: true,
        signTokenError: null,
      };
    case types.SIGN_TOKEN_FULFILLED:
      return {
        ...state,
        token: action.payload.token,
        tokenAddress: action.payload.address,
        isSigningToken: false,
      };
    case types.SIGN_TOKEN_REJECTED:
      return {
        ...state,
        isSigningToken: false,
        signTokenError: action.payload,
      };

    case types.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        tokenAddress: null,
      };
  }
  return state;
}

import types from './types';

// TODO: Replace this with full user object once auth is really done
interface AuthedUser {
  name: string;
  email: string;
  address: string;
}

export interface AuthState {
  user: AuthedUser | null;
  isAuthingUser: boolean;
  authUserError: string | null;

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
        user: action.payload,
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
      };
  }
  return state;
}

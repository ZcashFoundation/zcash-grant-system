import types from './types';
import { Dispatch } from 'redux';
import { sleep } from 'utils/helpers';
import { AppState } from 'store/reducers';

type GetState = () => AppState;

export function authUser() {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    const token = getState().auth.token;
    if (!token) {
      return;
    }

    // TODO: Implement authentication
    dispatch({ type: types.AUTH_USER_PENDING });
    await sleep(500);
    dispatch({
      type: types.AUTH_USER_REJECTED,
      payload: 'Auth not implemented yet',
      error: true,
    });
  };
}

export function createUser(address: string, name: string, email: string) {
  return async (dispatch: Dispatch<any>) => {
    // TODO: Implement user creation
    dispatch({ type: types.CREATE_USER_PENDING });
    await sleep(500);
    dispatch({
      type: types.CREATE_USER_FULFILLED,
      payload: {
        user: {
          address,
          name,
          email,
        },
        token: Math.random(),
      },
    });
  };
}

export function signToken(address: string) {
  return async (dispatch: Dispatch<any>) => {
    // TODO: Implement signing
    dispatch({ type: types.SIGN_TOKEN_PENDING });
    await sleep(500);
    dispatch({
      type: types.SIGN_TOKEN_FULFILLED,
      payload: {
        token: Math.random(),
        address,
      },
    });
  };
}

export function setToken(address: string, signedMessage: string) {
  // TODO: Check token for errors
  return {
    type: types.SIGN_TOKEN_FULFILLED,
    payload: {
      token: signedMessage,
      address,
    },
  };
}

export function logout() {
  return { type: types.LOGOUT };
}

import types from './types';
import { Dispatch } from 'redux';
import { sleep } from 'utils/helpers';
import { AppState } from 'store/reducers';
import { createUser as apiCreateUser, getUser as apiGetUser } from 'api/api';

type GetState = () => AppState;

export function authUser(address: string) {
  return async (dispatch: Dispatch<any>) => {
    dispatch({ type: types.AUTH_USER_PENDING });

    // TODO: Actually auth using a signed token
    try {
      const res = await apiGetUser(address);
      dispatch({
        type: types.AUTH_USER_FULFILLED,
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: types.AUTH_USER_REJECTED,
        payload: err.message || err.toString(),
        error: true,
      });
    }
  };
}

export function createUser(user: {
  address: string;
  email: string;
  name: string;
  title: string;
}) {
  return async (dispatch: Dispatch<any>) => {
    dispatch({ type: types.CREATE_USER_PENDING });

    try {
      // TODO: Pass real token
      const token = Math.random().toString();
      const res = await apiCreateUser({
        accountAddress: user.address,
        emailAddress: user.email,
        displayName: user.name,
        title: user.title,
        token,
      });
      dispatch({
        type: types.CREATE_USER_FULFILLED,
        payload: {
          user: res.data,
          token,
        },
      });
    } catch (err) {
      dispatch({
        type: types.CREATE_USER_REJECTED,
        payload: err.message || err.toString(),
        error: true,
      });
    }
  };
}

export function checkUser(address: string) {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    const checkedUsers = getState().auth.checkedUsers;
    if (checkedUsers[address] !== undefined) {
      return;
    }

    dispatch({ type: types.CHECK_USER_PENDING });

    try {
      const res = await apiGetUser(address);
      dispatch({
        type: types.CHECK_USER_FULFILLED,
        payload: {
          address,
          user: res.data,
        },
      });
    } catch (err) {
      if (err.response && err.response.status === 404) {
        dispatch({
          type: types.CHECK_USER_FULFILLED,
          payload: {
            address,
            user: false,
          },
        });
      } else {
        dispatch({
          type: types.CHECK_USER_REJECTED,
          payload: err.message || err.toString(),
          error: true,
        });
      }
    }
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

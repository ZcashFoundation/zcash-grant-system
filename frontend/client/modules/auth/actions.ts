import types from './types';
import { Dispatch } from 'redux';
import * as Sentry from '@sentry/browser';
// import { sleep } from 'utils/helpers';
import { AppState } from 'store/reducers';
import {
  // createUser as apiCreateUser,
  getUser as apiGetUser,
  // authUser as apiAuthUser,
} from 'api/api';

type GetState = () => AppState;

// Auth from previous state, or request signature with new auth
export function authUser(address: string) {
  return async (dispatch: Dispatch<any>) => {
    dispatch({ type: types.AUTH_USER_PENDING });

    try {
      console.log('TODO - apiAuthUser', address);
      throw new Error('TODO - apiAuthUser');
      // const res = await apiAuthUser({
      //   accountAddress: address,
      //   signedMessage: authSignature.signedMessage,
      //   rawTypedData: JSON.stringify(authSignature.rawTypedData),
      // });

      // sentry user scope
      Sentry.configureScope(scope => {
        scope.setUser({
          // email: res.data.emailAddress,
          // accountAddress: res.data.accountAddress,
        });
      });
      // dispatch({
      //   type: types.AUTH_USER_FULFILLED,
      //   payload: {
      //     user: res.data,
      //     authSignature,
      //   },
      // });
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
      console.log('TODO - apiCreateUser', user);
      throw new Error('TODO - apiCreateUser');
      // const res = await apiCreateUser({
      //   accountAddress: user.address,
      //   emailAddress: user.email,
      //   displayName: user.name,
      //   title: user.title,
      //   signedMessage: authSignature.signedMessage,
      //   rawTypedData: JSON.stringify(authSignature.rawTypedData),
      // });
      // dispatch({
      //   type: types.CREATE_USER_FULFILLED,
      //   payload: {
      //     user: res.data,
      //     authSignature,
      //   },
      // });
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

export function logout() {
  return { type: types.LOGOUT };
}

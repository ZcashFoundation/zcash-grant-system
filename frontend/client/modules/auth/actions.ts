import types from './types';
import { Dispatch } from 'redux';
import * as Sentry from '@sentry/browser';
import {
  // createUser as apiCreateUser,
  checkUserAuth,
  authUser as apiAuthUser,
  logoutUser,
} from 'api/api';
import { User } from 'types';

function setSentryScope(user: User) {
  Sentry.configureScope(scope => {
    scope.setUser({
      id: '' + user.userid,
    });
  });
}

// check if user has authenticated session
export function checkUser() {
  return async (dispatch: Dispatch<any>) => {
    dispatch({ type: types.CHECK_USER_PENDING });
    try {
      const res = await checkUserAuth();
      setSentryScope(res.data);
      dispatch({
        type: types.CHECK_USER_FULFILLED,
        payload: {
          user: res.data,
        },
      });
    } catch (err) {
      dispatch({
        type: types.CHECK_USER_REJECTED,
        payload: err.message || err.toString(),
        error: true,
      });
    }
  };
}

export function authUser(email: string, password: string) {
  return async (dispatch: Dispatch<any>) => {
    dispatch({ type: types.AUTH_USER_PENDING });
    try {
      const res = await apiAuthUser({ email, password });
      setSentryScope(res.data);
      dispatch({
        type: types.AUTH_USER_FULFILLED,
        payload: {
          user: res.data,
        },
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

export function logout() {
  return async (dispatch: Dispatch<any>) => {
    await dispatch({
      type: types.LOGOUT,
      payload: logoutUser(),
    });
  };
}

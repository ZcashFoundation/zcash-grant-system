import types from './types';
import { Dispatch } from 'redux';
import * as Sentry from '@sentry/browser';
import { RouteProps } from 'react-router-dom';
import {
  createUser as apiCreateUser,
  checkUserAuth,
  authUser as apiAuthUser,
  logoutUser,
} from 'api/api';
import { AppState } from 'store/reducers';
import { User } from 'types';

type GetState = () => AppState;

function setSentryScope(user: User) {
  Sentry.configureScope(scope => {
    scope.setUser({
      id: user.userid.toString(),
    });
  });
}

// check if user has authenticated session
export function checkUser() {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    const state = getState();
    if (state.auth.isAuthingUser || state.auth.isLoggingOut) {
      // this happens when axios calls checkUser upon seeing a change in the
      // custom auth-header, this call will not be ignored on other tabs not
      // initiating the authentication related behaviors
      console.info(
        'ignoring checkUser action b/c we are currently authing or logging out',
      );
      return;
    }
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
  email: string;
  password: string;
  name: string;
  title: string;
}) {
  return async (dispatch: Dispatch<any>) => {
    dispatch({ type: types.CREATE_USER_PENDING });
    try {
      const res = await apiCreateUser(user);
      dispatch({
        type: types.CREATE_USER_FULFILLED,
        payload: {
          user: res.data,
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

export function logout() {
  return async (dispatch: Dispatch<any>) => {
    await dispatch({
      type: types.LOGOUT,
      payload: logoutUser(),
    });
  };
}

export function setAuthForwardLocation(location: RouteProps['location']) {
  return {
    type: types.SET_AUTH_FORWARD_LOCATION,
    payload: { location },
  };
}

import types from './types';
import { Dispatch } from 'redux';
import * as Sentry from '@sentry/browser';
import { sleep } from 'utils/helpers';
import { generateAuthSignatureData } from 'utils/auth';
import { AppState } from 'store/reducers';
import {
  createUser as apiCreateUser,
  getUser as apiGetUser,
  authUser as apiAuthUser,
} from 'api/api';
import { signData } from 'modules/web3/actions';
import { AuthSignatureData } from 'types';

type GetState = () => AppState;

const getAuthSignature = (
  address: string,
  dispatch: Dispatch<any>,
): Promise<AuthSignatureData> => {
  const sigData = generateAuthSignatureData(address);
  return (dispatch(
    signData(sigData.data, sigData.types, sigData.primaryType),
  ) as any) as Promise<AuthSignatureData>;
};

// Auth from previous state, or request signature with new auth
export function authUser(address: string, authSignature?: Falsy | AuthSignatureData) {
  return async (dispatch: Dispatch<any>) => {
    dispatch({ type: types.AUTH_USER_PENDING });

    try {
      if (!authSignature) {
        authSignature = await getAuthSignature(address, dispatch);
      }
      const res = await apiAuthUser({
        accountAddress: address,
        signedMessage: authSignature.signedMessage,
        rawTypedData: JSON.stringify(authSignature.rawTypedData),
      });
      // sentry user scope
      Sentry.configureScope(scope => {
        scope.setUser({
          email: res.data.emailAddress,
          accountAddress: res.data.accountAddress,
        });
      });
      dispatch({
        type: types.AUTH_USER_FULFILLED,
        payload: {
          user: res.data,
          authSignature,
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
      const authSignature = await getAuthSignature(user.address, dispatch);
      const res = await apiCreateUser({
        accountAddress: user.address,
        emailAddress: user.email,
        displayName: user.name,
        title: user.title,
        signedMessage: authSignature.signedMessage,
        rawTypedData: JSON.stringify(authSignature.rawTypedData),
      });
      dispatch({
        type: types.CREATE_USER_FULFILLED,
        payload: {
          user: res.data,
          authSignature,
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

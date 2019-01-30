import types from './types';
import { getRFPs, getRFP } from 'api/api';
import { Dispatch } from 'redux';
import { RFP } from 'types';

export function fetchRfps() {
  return async (dispatch: Dispatch<any>) => {
    return dispatch({
      type: types.FETCH_RFPS,
      payload: async () => {
        return (await getRFPs()).data;
      },
    });
  };
}

export function fetchRfp(rfpId: RFP['id']) {
  return async (dispatch: Dispatch<any>) => {
    return dispatch({
      type: types.FETCH_RFP,
      payload: async () => {
        return (await getRFP(rfpId)).data;
      },
    });
  };
}

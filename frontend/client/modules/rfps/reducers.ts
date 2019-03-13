import types from './types';
import { RFP } from 'types';

export interface RFPState {
  rfps: RFP[];
  fetchRfpsError: null | string;
  isFetchingRfps: boolean;
  hasFetchedRfps: boolean;
}

export const INITIAL_STATE: RFPState = {
  rfps: [],
  fetchRfpsError: null,
  isFetchingRfps: false,
  hasFetchedRfps: false,
};

function addRfp(state: RFPState, payload: RFP) {
  const existingProposal = state.rfps.find((rfp: RFP) => rfp.id === payload.id);

  const rfps = [...state.rfps];
  if (!existingProposal) {
    rfps.push(payload);
  } else {
    const index = rfps.indexOf(existingProposal);
    rfps[index] = payload;
  }

  return {
    ...state,
    isFetchingRfps: false,
    rfps,
  };
}

export default (state: RFPState = INITIAL_STATE, action: any): RFPState => {
  const { payload } = action;
  switch (action.type) {
    case types.FETCH_RFPS_PENDING:
    case types.FETCH_RFP_PENDING:
      return {
        ...state,
        fetchRfpsError: null,
        isFetchingRfps: true,
      };
    case types.FETCH_RFPS_REJECTED:
    case types.FETCH_RFP_REJECTED:
      return {
        ...state,
        fetchRfpsError: (payload && payload.message) || payload.toString(),
        isFetchingRfps: false,
      };
    case types.FETCH_RFPS_FULFILLED:
      return {
        ...state,
        rfps: payload,
        fetchRfpsError: null,
        isFetchingRfps: false,
        hasFetchedRfps: true,
      };

    case types.FETCH_RFP_FULFILLED:
      return addRfp(state, payload);
  }

  return state;
};

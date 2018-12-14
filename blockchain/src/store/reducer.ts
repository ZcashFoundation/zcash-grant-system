import type, { AddressCollection } from './types';
import { ActionTypes } from './actions';

export interface StoreState {
  watchAddresses: AddressCollection[];
  watchAddressMap: { [contributionId: string]: AddressCollection };
}

const INITIAL_STATE: StoreState = {
  watchAddresses: [],
  watchAddressMap: {},
};

export function reducer(state: StoreState = INITIAL_STATE, action: ActionTypes): StoreState {
  const { payload } = action;
  switch(action.type) {
    case type.GENERATE_ADDRESSES:
      return {
        ...state,
        watchAddresses: [
          ...state.watchAddresses,
          payload.addresses,
        ],
        watchAddressMap: {
          ...state.watchAddressMap,
          [action.payload.contributionId]: action.payload.addresses,
        },
      };
  }
  return state;
}

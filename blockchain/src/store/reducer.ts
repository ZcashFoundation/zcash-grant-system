import type, { AddressCollection } from './types';
import { ActionTypes } from './actions';
import { dedupeArray, removeItem } from '../util';

export interface StoreState {
  watchAddresses: AddressCollection[];
  watchAddressMap: { [contributionId: string]: AddressCollection };
  watchDisclosures: string[];
}

const INITIAL_STATE: StoreState = {
  watchAddresses: [],
  watchAddressMap: {},
  watchDisclosures: [],
};

export function reducer(state: StoreState = INITIAL_STATE, action: ActionTypes): StoreState {
  switch(action.type) {
    case type.GENERATE_ADDRESSES:
      return {
        ...state,
        watchAddresses: [
          ...state.watchAddresses,
          action.payload.addresses,
        ],
        watchAddressMap: {
          ...state.watchAddressMap,
          [action.payload.contributionId]: action.payload.addresses,
        },
      };
    
    case type.ADD_PAYMENT_DISCLOSURE:
      return {
        ...state,
        watchDisclosures: dedupeArray([
          ...state.watchDisclosures,
          action.payload,
        ]),
      };

    case type.CONFIRM_PAYMENT_DISCLOSURE:
      return {
        ...state,
        watchDisclosures: removeItem(
          state.watchDisclosures,
          action.payload,
        ),
      }
  }
  return state;
}

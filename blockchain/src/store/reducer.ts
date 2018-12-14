import type from './types';

export interface StoreState {
  watchAddresses: string[];
  watchAddressMap: { [contributionId: string]: string };
}

const INITIAL_STATE: StoreState = {
  watchAddresses: [],
  watchAddressMap: {},
};

export function reducer(state: StoreState = INITIAL_STATE, action: any): StoreState {
  const { payload } = action;
  switch(action.type) {
    case type.GENERATE_ADDRESS:
      return {
        ...state,
        watchAddresses: [
          ...state.watchAddresses,
          payload.address,
        ],
        watchAddressMap: {
          ...state.watchAddressMap,
          [payload.contributionId]: payload.address,
        },
      };
  }
  return state;
}

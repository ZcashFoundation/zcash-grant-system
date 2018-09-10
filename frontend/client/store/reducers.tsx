import { combineReducers } from 'redux';

import web3, { Web3State, INITIAL_STATE as web3InitialState } from 'modules/web3';
import proposal, {
  ProposalState,
  INITIAL_STATE as proposalInitialState,
} from 'modules/proposals';

export interface AppState {
  proposal: ProposalState;
  web3: Web3State;
}

export const combineInitialState = {
  proposal: proposalInitialState,
  web3: web3InitialState,
};

export default combineReducers<AppState>({
  proposal,
  web3,
});

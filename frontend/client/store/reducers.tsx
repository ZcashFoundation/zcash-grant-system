import { combineReducers } from 'redux';
import web3, { Web3State, INITIAL_STATE as web3InitialState } from 'modules/web3';
import proposal, {
  ProposalState,
  INITIAL_STATE as proposalInitialState,
} from 'modules/proposals';
import create, { CreateState, INITIAL_STATE as createInitialState } from 'modules/create';

export interface AppState {
  proposal: ProposalState;
  web3: Web3State;
  create: CreateState;
}

export const combineInitialState: AppState = {
  proposal: proposalInitialState,
  web3: web3InitialState,
  create: createInitialState,
};

export default combineReducers<AppState>({
  proposal,
  web3,
  create,
});

import { combineReducers } from 'redux';
import web3, { Web3State, INITIAL_STATE as web3InitialState } from 'modules/web3';
import proposal, {
  ProposalState,
  INITIAL_STATE as proposalInitialState,
} from 'modules/proposals';
import create, { CreateState, INITIAL_STATE as createInitialState } from 'modules/create';
import auth, { AuthState, INITIAL_STATE as authInitialState } from 'modules/auth';

export interface AppState {
  proposal: ProposalState;
  web3: Web3State;
  create: CreateState;
  auth: AuthState;
}

export const combineInitialState: AppState = {
  proposal: proposalInitialState,
  web3: web3InitialState,
  create: createInitialState,
  auth: authInitialState,
};

export default combineReducers<AppState>({
  proposal,
  web3,
  create,
  auth,
});

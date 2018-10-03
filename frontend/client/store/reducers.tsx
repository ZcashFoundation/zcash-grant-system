import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import web3, { Web3State, INITIAL_STATE as web3InitialState } from 'modules/web3';
import proposal, {
  ProposalState,
  INITIAL_STATE as proposalInitialState,
} from 'modules/proposals';
import create, { CreateState, INITIAL_STATE as createInitialState } from 'modules/create';
import authReducer, {
  AuthState,
  INITIAL_STATE as authInitialState,
  authPersistConfig,
} from 'modules/auth';
import users, { UsersState, INITIAL_STATE as usersInitialState } from 'modules/users';

export interface AppState {
  proposal: ProposalState;
  web3: Web3State;
  create: CreateState;
  users: UsersState;
  auth: AuthState;
}

export const combineInitialState: AppState = {
  proposal: proposalInitialState,
  web3: web3InitialState,
  create: createInitialState,
  users: usersInitialState,
  auth: authInitialState,
};

export default combineReducers<AppState>({
  proposal,
  web3,
  create,
  auth: persistReducer(authPersistConfig, authReducer),
  users,
});

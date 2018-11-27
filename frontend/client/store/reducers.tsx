import { combineReducers, Reducer } from 'redux';
import { connectRouter, RouterState } from 'connected-react-router';
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
import history from './history';

export interface AppState {
  proposal: ProposalState;
  web3: Web3State;
  create: CreateState;
  users: UsersState;
  auth: AuthState;
  router: RouterState;
}

export const combineInitialState: Partial<AppState> = {
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
  users,
  // Don't allow for redux-persist's _persist key to be touched in our code
  auth: (persistReducer(authPersistConfig, authReducer) as any) as Reducer<AuthState>,
  router: connectRouter(history),
});

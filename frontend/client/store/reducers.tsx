import { combineReducers, Reducer } from 'redux';
import { connectRouter, RouterState } from 'connected-react-router';
import { persistReducer } from 'redux-persist';
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
import rfps, { RFPState, INITIAL_STATE as rfpsInitialState } from 'modules/rfps';
import history from './history';

export interface AppState {
  proposal: ProposalState;
  create: CreateState;
  users: UsersState;
  auth: AuthState;
  rfps: RFPState;
  router: RouterState;
}

export const combineInitialState: Omit<AppState, 'router'> = {
  proposal: proposalInitialState,
  create: createInitialState,
  users: usersInitialState,
  auth: authInitialState,
  rfps: rfpsInitialState,
};

export default combineReducers<AppState>({
  proposal,
  create,
  users,
  rfps,
  // Don't allow for redux-persist's _persist key to be touched in our code
  auth: (persistReducer(authPersistConfig, authReducer) as any) as Reducer<AuthState>,
  router: connectRouter(history),
});

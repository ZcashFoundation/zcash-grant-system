import { combineReducers } from 'redux';
import { connectRouter, RouterState } from 'connected-react-router';
import proposal, {
  ProposalState,
  INITIAL_STATE as proposalInitialState,
} from 'modules/proposals';
import ccr, { CCRState, INITIAL_STATE as ccrInitialState } from 'modules/ccr';
import create, { CreateState, INITIAL_STATE as createInitialState } from 'modules/create';
import auth, { AuthState, INITIAL_STATE as authInitialState } from 'modules/auth';
import users, { UsersState, INITIAL_STATE as usersInitialState } from 'modules/users';
import rfps, { RFPState, INITIAL_STATE as rfpsInitialState } from 'modules/rfps';
import history from './history';

export interface AppState {
  proposal: ProposalState;
  create: CreateState;
  ccr: CCRState;
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
  ccr: ccrInitialState,
};

export default combineReducers<AppState>({
  ccr,
  proposal,
  create,
  users,
  rfps,
  auth,
  router: connectRouter(history),
});

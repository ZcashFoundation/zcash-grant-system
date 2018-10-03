import lodash from 'lodash';
import types, { UserProposal, UserComment } from './types';
import { TeamMember } from 'modules/create/types';

export interface UserState extends TeamMember {
  isFetching: boolean;
  hasFetched: boolean;
  fetchError: number | null;
  isFetchingCreated: boolean;
  hasFetchedCreated: boolean;
  fetchErrorCreated: number | null;
  createdProposals: UserProposal[];
  isFetchingFunded: boolean;
  hasFetchedFunded: boolean;
  fetchErrorFunded: number | null;
  fundedProposals: UserProposal[];
  isFetchingCommments: boolean;
  hasFetchedComments: boolean;
  fetchErrorComments: number | null;
  comments: UserComment[];
}

export interface UsersState {
  map: { [index: string]: UserState };
}

export const INITIAL_USER_STATE: UserState = {
  ethAddress: '',
  avatarUrl: '',
  name: '',
  emailAddress: '',
  socialAccounts: {},
  title: '',
  isFetching: false,
  hasFetched: false,
  fetchError: null,
  isFetchingCreated: false,
  hasFetchedCreated: false,
  fetchErrorCreated: null,
  createdProposals: [],
  isFetchingFunded: false,
  hasFetchedFunded: false,
  fetchErrorFunded: null,
  fundedProposals: [],
  isFetchingCommments: false,
  hasFetchedComments: false,
  fetchErrorComments: null,
  comments: [],
};

export const INITIAL_STATE: UsersState = {
  map: {},
};

export default (state = INITIAL_STATE, action: any) => {
  const { payload } = action;
  const userFetchId = payload && payload.userFetchId;
  const proposals = payload && payload.proposals;
  const comments = payload && payload.comments;
  const errorStatus = payload && payload.error && payload.error.response.status;
  switch (action.type) {
    case types.FETCH_USER_PENDING:
      return updateState(state, userFetchId, { isFetching: true, fetchError: null });
    case types.FETCH_USER_FULFILLED:
      return updateState(
        state,
        userFetchId,
        { isFetching: false, hasFetched: true },
        payload.user,
      );
    case types.FETCH_USER_REJECTED:
      return updateState(state, userFetchId, {
        isFetching: false,
        hasFetched: true,
        fetchError: errorStatus,
      });
    // created proposals
    case types.FETCH_USER_CREATED_PENDING:
      return updateState(state, userFetchId, {
        isFetchingCreated: true,
        fetchErrorCreated: null,
      });
    case types.FETCH_USER_CREATED_FULFILLED:
      return updateState(state, userFetchId, {
        isFetchingCreated: false,
        hasFetchedCreated: true,
        createdProposals: proposals,
      });
    case types.FETCH_USER_CREATED_REJECTED:
      return updateState(state, userFetchId, {
        isFetchingCreated: false,
        hasFetchedCreated: true,
        fetchErrorCreated: errorStatus,
      });
    // funded proposals
    case types.FETCH_USER_FUNDED_PENDING:
      return updateState(state, userFetchId, {
        isFetchingFunded: true,
        fetchErrorFunded: null,
      });
    case types.FETCH_USER_FUNDED_FULFILLED:
      return updateState(state, userFetchId, {
        isFetchingFunded: false,
        hasFetchedFunded: true,
        fundedProposals: proposals,
      });
    case types.FETCH_USER_FUNDED_REJECTED:
      return updateState(state, userFetchId, {
        isFetchingFunded: false,
        hasFetchedFunded: true,
        fetchErrorFunded: errorStatus,
      });
    // comments
    case types.FETCH_USER_COMMENTS_PENDING:
      return updateState(state, userFetchId, {
        isFetchingComments: true,
        fetchErrorComments: null,
      });
    case types.FETCH_USER_COMMENTS_FULFILLED:
      return updateState(state, userFetchId, {
        isFetchingComments: false,
        hasFetchedComments: true,
        comments,
      });
    case types.FETCH_USER_COMMENTS_REJECTED:
      return updateState(state, userFetchId, {
        isFetchingComments: false,
        hasFetchedComments: true,
        fetchErrorComments: errorStatus,
      });
    default:
      return state;
  }
};

function updateState(state: UsersState, id: string, updates: object, loaded?: UserState) {
  return {
    ...state,
    map: {
      ...state.map,
      [id]: lodash.defaultsDeep(updates, loaded, state.map[id] || INITIAL_USER_STATE),
    },
  };
}

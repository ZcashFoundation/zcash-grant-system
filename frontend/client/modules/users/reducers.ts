import lodash from 'lodash';
import { UserProposal, UserComment } from 'types';
import types from './types';
import { TeamMember } from 'types';

export interface UserState extends TeamMember {
  isFetching: boolean;
  hasFetched: boolean;
  fetchError: number | null;
  isUpdating: boolean;
  updateError: number | null;
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

export const INITIAL_TEAM_MEMBER_STATE: TeamMember = {
  ethAddress: '',
  avatarUrl: '',
  name: '',
  emailAddress: '',
  socialAccounts: {},
  title: '',
};

export const INITIAL_USER_STATE: UserState = {
  ...INITIAL_TEAM_MEMBER_STATE,
  isFetching: false,
  hasFetched: false,
  fetchError: null,
  isUpdating: false,
  updateError: null,
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
  const errorStatus =
    (payload &&
      payload.error &&
      payload.error.response &&
      payload.error.response.status) ||
    999;
  switch (action.type) {
    // fetch
    case types.FETCH_USER_PENDING:
      return updateStateFetch(state, userFetchId, { isFetching: true, fetchError: null });
    case types.FETCH_USER_FULFILLED:
      return updateStateFetch(
        state,
        userFetchId,
        { isFetching: false, hasFetched: true },
        payload.user,
      );
    case types.FETCH_USER_REJECTED:
      return updateStateFetch(state, userFetchId, {
        isFetching: false,
        hasFetched: true,
        fetchError: errorStatus,
      });
    // update
    case types.UPDATE_USER_PENDING:
      return updateStateFetch(state, payload.user.ethAddress, {
        isUpdating: true,
        updateError: null,
      });
    case types.UPDATE_USER_FULFILLED:
      return updateStateFetch(
        state,
        payload.user.ethAddress,
        { isUpdating: false },
        payload.user,
      );
    case types.UPDATE_USER_REJECTED:
      return updateStateFetch(state, payload.user.ethAddress, {
        isUpdating: false,
        updateError: errorStatus,
      });
    // created proposals
    case types.FETCH_USER_CREATED_PENDING:
      return updateStateFetch(state, userFetchId, {
        isFetchingCreated: true,
        fetchErrorCreated: null,
      });
    case types.FETCH_USER_CREATED_FULFILLED:
      return updateStateFetch(state, userFetchId, {
        isFetchingCreated: false,
        hasFetchedCreated: true,
        createdProposals: proposals,
      });
    case types.FETCH_USER_CREATED_REJECTED:
      return updateStateFetch(state, userFetchId, {
        isFetchingCreated: false,
        hasFetchedCreated: true,
        fetchErrorCreated: errorStatus,
      });
    // funded proposals
    case types.FETCH_USER_FUNDED_PENDING:
      return updateStateFetch(state, userFetchId, {
        isFetchingFunded: true,
        fetchErrorFunded: null,
      });
    case types.FETCH_USER_FUNDED_FULFILLED:
      return updateStateFetch(state, userFetchId, {
        isFetchingFunded: false,
        hasFetchedFunded: true,
        fundedProposals: proposals,
      });
    case types.FETCH_USER_FUNDED_REJECTED:
      return updateStateFetch(state, userFetchId, {
        isFetchingFunded: false,
        hasFetchedFunded: true,
        fetchErrorFunded: errorStatus,
      });
    // comments
    case types.FETCH_USER_COMMENTS_PENDING:
      return updateStateFetch(state, userFetchId, {
        isFetchingComments: true,
        fetchErrorComments: null,
      });
    case types.FETCH_USER_COMMENTS_FULFILLED:
      return updateStateFetch(state, userFetchId, {
        isFetchingComments: false,
        hasFetchedComments: true,
        comments,
      });
    case types.FETCH_USER_COMMENTS_REJECTED:
      return updateStateFetch(state, userFetchId, {
        isFetchingComments: false,
        hasFetchedComments: true,
        fetchErrorComments: errorStatus,
      });
    default:
      return state;
  }
};

function updateStateFetch(
  state: UsersState,
  id: string,
  updates: object,
  loaded?: UserState,
) {
  return {
    ...state,
    map: {
      ...state.map,
      [id]: lodash.defaults(updates, loaded, state.map[id] || INITIAL_USER_STATE),
    },
  };
}

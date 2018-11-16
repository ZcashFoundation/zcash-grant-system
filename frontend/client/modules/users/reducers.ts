import lodash from 'lodash';
import { UserProposal, UserComment, TeamInviteWithProposal } from 'types';
import types from './types';
import { TeamMember } from 'types';

export interface TeamInviteWithResponse extends TeamInviteWithProposal {
  isResponding: boolean;
  respondError: number | null;
}

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
  isFetchingComments: boolean;
  hasFetchedComments: boolean;
  fetchErrorComments: number | null;
  comments: UserComment[];
  isFetchingInvites: boolean;
  hasFetchedInvites: boolean;
  fetchErrorInvites: number | null;
  invites: TeamInviteWithResponse[];
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
  isFetchingComments: false,
  hasFetchedComments: false,
  fetchErrorComments: null,
  comments: [],
  isFetchingInvites: false,
  hasFetchedInvites: false,
  fetchErrorInvites: null,
  invites: [],
};

export const INITIAL_STATE: UsersState = {
  map: {},
};

export default (state = INITIAL_STATE, action: any) => {
  const { payload } = action;
  const userFetchId = payload && payload.userFetchId;
  const proposals = payload && payload.proposals;
  const comments = payload && payload.comments;
  const invites = payload && payload.invites;
  const errorStatus =
    (payload &&
      payload.error &&
      payload.error.response &&
      payload.error.response.status) ||
    999;
  switch (action.type) {
    // fetch
    case types.FETCH_USER_PENDING:
      return updateUserState(state, userFetchId, { isFetching: true, fetchError: null });
    case types.FETCH_USER_FULFILLED:
      return updateUserState(
        state,
        userFetchId,
        { isFetching: false, hasFetched: true },
        payload.user,
      );
    case types.FETCH_USER_REJECTED:
      return updateUserState(state, userFetchId, {
        isFetching: false,
        hasFetched: true,
        fetchError: errorStatus,
      });
    // update
    case types.UPDATE_USER_PENDING:
      return updateUserState(state, payload.user.ethAddress, {
        isUpdating: true,
        updateError: null,
      });
    case types.UPDATE_USER_FULFILLED:
      return updateUserState(
        state,
        payload.user.ethAddress,
        { isUpdating: false },
        payload.user,
      );
    case types.UPDATE_USER_REJECTED:
      return updateUserState(state, payload.user.ethAddress, {
        isUpdating: false,
        updateError: errorStatus,
      });
    // created proposals
    case types.FETCH_USER_CREATED_PENDING:
      return updateUserState(state, userFetchId, {
        isFetchingCreated: true,
        fetchErrorCreated: null,
      });
    case types.FETCH_USER_CREATED_FULFILLED:
      return updateUserState(state, userFetchId, {
        isFetchingCreated: false,
        hasFetchedCreated: true,
        createdProposals: proposals,
      });
    case types.FETCH_USER_CREATED_REJECTED:
      return updateUserState(state, userFetchId, {
        isFetchingCreated: false,
        hasFetchedCreated: true,
        fetchErrorCreated: errorStatus,
      });
    // funded proposals
    case types.FETCH_USER_FUNDED_PENDING:
      return updateUserState(state, userFetchId, {
        isFetchingFunded: true,
        fetchErrorFunded: null,
      });
    case types.FETCH_USER_FUNDED_FULFILLED:
      return updateUserState(state, userFetchId, {
        isFetchingFunded: false,
        hasFetchedFunded: true,
        fundedProposals: proposals,
      });
    case types.FETCH_USER_FUNDED_REJECTED:
      return updateUserState(state, userFetchId, {
        isFetchingFunded: false,
        hasFetchedFunded: true,
        fetchErrorFunded: errorStatus,
      });
    // comments
    case types.FETCH_USER_COMMENTS_PENDING:
      return updateUserState(state, userFetchId, {
        isFetchingComments: true,
        fetchErrorComments: null,
      });
    case types.FETCH_USER_COMMENTS_FULFILLED:
      return updateUserState(state, userFetchId, {
        isFetchingComments: false,
        hasFetchedComments: true,
        comments,
      });
    case types.FETCH_USER_COMMENTS_REJECTED:
      return updateUserState(state, userFetchId, {
        isFetchingComments: false,
        hasFetchedComments: true,
        fetchErrorComments: errorStatus,
      });
    // invites
    case types.FETCH_USER_INVITES_PENDING:
      return updateUserState(state, userFetchId, {
        isFetchingInvites: true,
        fetchErrorInvites: null,
      });
    case types.FETCH_USER_INVITES_FULFILLED:
      return updateUserState(state, userFetchId, {
        isFetchingInvites: false,
        hasFetchedInvites: true,
        invites,
      });
    case types.FETCH_USER_INVITES_REJECTED:
      return updateUserState(state, userFetchId, {
        isFetchingInvites: false,
        hasFetchedInvites: true,
        fetchErrorInvites: errorStatus,
      });
    // invites
    case types.FETCH_USER_INVITES_PENDING:
      return updateUserState(state, userFetchId, {
        isFetchingInvites: true,
        fetchErrorInvites: null,
      });
    case types.FETCH_USER_INVITES_FULFILLED:
      return updateUserState(state, userFetchId, {
        isFetchingInvites: false,
        hasFetchedInvites: true,
        invites,
      });
    case types.FETCH_USER_INVITES_REJECTED:
      return updateUserState(state, userFetchId, {
        isFetchingInvites: false,
        hasFetchedInvites: true,
        fetchErrorInvites: errorStatus,
      });
    // invite response
    case types.RESPOND_TO_INVITE_PENDING:
      return updateTeamInvite(state, payload.userId, payload.inviteId, {
        isResponding: true,
        respondError: null,
      });
    case types.RESPOND_TO_INVITE_FULFILLED:
      return removeTeamInvite(state, payload.userId, payload.inviteId);
    case types.RESPOND_TO_INVITE_REJECTED:
      return updateTeamInvite(state, payload.userId, payload.inviteId, {
        isResponding: false,
        respondError: errorStatus,
      });
    // default
    default:
      return state;
  }
};

function updateUserState(
  state: UsersState,
  id: string | number,
  updates: Partial<UserState>,
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

function updateTeamInvite(
  state: UsersState,
  userid: string | number,
  inviteid: string | number,
  updates: Partial<TeamInviteWithResponse>,
) {
  const userUpdates = {
    invites: state.map[userid].invites.map(inv => {
      if (inv.id === inviteid) {
        return {
          ...inv,
          ...updates,
        };
      }
      return inv;
    }),
  };
  return updateUserState(state, userid, userUpdates);
}

function removeTeamInvite(
  state: UsersState,
  userid: string | number,
  inviteid: string | number,
) {
  const userUpdates = {
    invites: state.map[userid].invites.filter(inv => inv.id !== inviteid),
  };
  return updateUserState(state, userid, userUpdates);
}

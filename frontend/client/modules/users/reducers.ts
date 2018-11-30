import lodash from 'lodash';
import { UserProposal, UserComment, TeamInviteWithProposal } from 'types';
import types from './types';
import { User } from 'types';

export interface TeamInviteWithResponse extends TeamInviteWithProposal {
  isResponding: boolean;
  respondError: number | null;
}

export interface UserState extends User {
  isFetching: boolean;
  hasFetched: boolean;
  fetchError: number | null;
  isUpdating: boolean;
  updateError: number | null;
  createdProposals: UserProposal[];
  fundedProposals: UserProposal[];
  comments: UserComment[];
  isFetchingInvites: boolean;
  hasFetchedInvites: boolean;
  fetchErrorInvites: number | null;
  invites: TeamInviteWithResponse[];
}

export interface UsersState {
  map: { [index: string]: UserState };
}

export const INITIAL_TEAM_MEMBER_STATE: User = {
  userid: 0,
  accountAddress: '',
  avatar: null,
  displayName: '',
  emailAddress: '',
  socialMedias: [],
  title: '',
};

export const INITIAL_USER_STATE: UserState = {
  ...INITIAL_TEAM_MEMBER_STATE,
  isFetching: false,
  hasFetched: false,
  fetchError: null,
  isUpdating: false,
  updateError: null,
  createdProposals: [],
  fundedProposals: [],
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
      return updateUserState(state, payload.user.accountAddress, {
        isUpdating: true,
        updateError: null,
      });
    case types.UPDATE_USER_FULFILLED:
      return updateUserState(
        state,
        payload.user.accountAddress,
        { isUpdating: false },
        payload.user,
      );
    case types.UPDATE_USER_REJECTED:
      return updateUserState(state, payload.user.accountAddress, {
        isUpdating: false,
        updateError: errorStatus,
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

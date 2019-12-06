import lodash from 'lodash';
import {
  User,
  UserProposal,
  UserComment,
  UserContribution,
  TeamInviteWithProposal,
  UserProposalArbiter,
  UserCCR,
} from 'types';
import types from './types';

export interface TeamInviteWithResponse extends TeamInviteWithProposal {
  isResponding: boolean;
  respondError: string | null;
}

export interface UserState extends User {
  isFetching: boolean;
  hasFetched: boolean;
  fetchError: string | null;
  isUpdating: boolean;
  updateError: string | null;
  pendingProposals: UserProposal[];
  pendingRequests: UserCCR[];
  arbitrated: UserProposalArbiter[];
  proposals: UserProposal[];
  requests: UserCCR[];
  contributions: UserContribution[];
  comments: UserComment[];
  isFetchingInvites: boolean;
  hasFetchedInvites: boolean;
  fetchErrorInvites: string | null;
  invites: TeamInviteWithResponse[];
}

export interface UsersState {
  map: { [index: string]: UserState };
}

export const INITIAL_USER: User = {
  userid: 0,
  avatar: null,
  displayName: '',
  emailAddress: '',
  emailVerified: false,
  socialMedias: [],
  title: '',
};

export const INITIAL_USER_STATE: UserState = {
  ...INITIAL_USER,
  isFetching: false,
  hasFetched: false,
  fetchError: null,
  isUpdating: false,
  updateError: null,
  pendingProposals: [],
  pendingRequests: [],
  arbitrated: [],
  proposals: [],
  requests: [],
  contributions: [],
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
  const errorMessage =
    (payload && payload.error && (payload.error.message || payload.error.toString())) ||
    null;

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
        fetchError: errorMessage,
      });
    // update
    case types.UPDATE_USER_PENDING:
      return updateUserState(state, payload.user.userid, {
        isUpdating: true,
        updateError: null,
      });
    case types.UPDATE_USER_FULFILLED:
      return updateUserState(
        state,
        payload.user.userid,
        { isUpdating: false },
        payload.user,
      );
    case types.UPDATE_USER_REJECTED:
      return updateUserState(state, payload.user.userid, {
        isUpdating: false,
        updateError: errorMessage,
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
        fetchErrorInvites: errorMessage,
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
        respondError: errorMessage,
      });
    // delete contribution
    case types.DELETE_CONTRIBUTION:
      return updateUserState(state, payload.userId, {
        contributions: state.map[payload.userId].contributions.filter(
          c => c.id !== payload.contributionId,
        ),
      });
    // proposal delete
    case types.USER_DELETE_PROPOSAL_FULFILLED:
      return removePendingProposal(state, payload.userId, payload.proposalId);
    // proposal publish
    case types.USER_PUBLISH_PROPOSAL_FULFILLED:
      return updatePublishedProposal(state, payload.userId, payload.proposal);
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

function removePendingProposal(
  state: UsersState,
  userId: string | number,
  proposalId: number,
) {
  const pendingProposals = state.map[userId].pendingProposals.filter(
    p => p.proposalId !== proposalId,
  );
  const userUpdates = {
    pendingProposals,
  };
  return updateUserState(state, userId, userUpdates);
}

function updatePublishedProposal(
  state: UsersState,
  userId: string | number,
  proposal: UserProposal,
) {
  const withoutPending = removePendingProposal(state, userId, proposal.proposalId);
  const userUpdates = {
    proposals: [proposal, ...state.map[userId].proposals],
  };
  return updateUserState(withoutPending, userId, userUpdates);
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

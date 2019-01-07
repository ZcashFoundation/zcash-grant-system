import { User } from 'types';
import types from './types';
import {
  getUser,
  updateUser as apiUpdateUser,
  fetchUserInvites as apiFetchUserInvites,
  putInviteResponse,
  deleteProposalDraft,
  putProposalPublish,
} from 'api/api';
import { Dispatch } from 'redux';
import { cleanClone } from 'utils/helpers';
import { INITIAL_USER } from 'modules/users/reducers';

export function fetchUser(userFetchId: string) {
  return async (dispatch: Dispatch<any>) => {
    dispatch({ type: types.FETCH_USER_PENDING, payload: { userFetchId } });
    try {
      const { data: user } = await getUser(userFetchId);
      dispatch({
        type: types.FETCH_USER_FULFILLED,
        payload: { userFetchId, user },
      });
    } catch (error) {
      dispatch({ type: types.FETCH_USER_REJECTED, payload: { userFetchId, error } });
    }
  };
}

export function updateUser(user: User) {
  const userClone = cleanClone(INITIAL_USER, user);
  return async (dispatch: Dispatch<any>) => {
    dispatch({ type: types.UPDATE_USER_PENDING, payload: { user } });
    try {
      const { data: updatedUser } = await apiUpdateUser(userClone);
      dispatch({
        type: types.UPDATE_USER_FULFILLED,
        payload: { user: updatedUser },
      });
    } catch (error) {
      dispatch({ type: types.UPDATE_USER_REJECTED, payload: { user, error } });
    }
  };
}

export function fetchUserInvites(userFetchId: string) {
  return async (dispatch: Dispatch<any>) => {
    dispatch({
      type: types.FETCH_USER_INVITES_PENDING,
      payload: { userFetchId },
    });

    try {
      const res = await apiFetchUserInvites(userFetchId);
      const invites = res.data.sort((a, b) => (a.dateCreated > b.dateCreated ? -1 : 1));
      dispatch({
        type: types.FETCH_USER_INVITES_FULFILLED,
        payload: { userFetchId, invites },
      });
    } catch (error) {
      dispatch({
        type: types.FETCH_USER_INVITES_REJECTED,
        payload: { userFetchId, error },
      });
    }
  };
}

export function respondToInvite(
  userId: string | number,
  inviteId: string | number,
  response: boolean,
) {
  return async (dispatch: Dispatch<any>) => {
    dispatch({
      type: types.RESPOND_TO_INVITE_PENDING,
      payload: { userId, inviteId, response },
    });

    try {
      await putInviteResponse(userId, inviteId, response);
      dispatch({
        type: types.RESPOND_TO_INVITE_FULFILLED,
        payload: { userId, inviteId, response },
      });
    } catch (error) {
      dispatch({
        type: types.RESPOND_TO_INVITE_REJECTED,
        payload: { userId, inviteId, error },
      });
    }
  };
}

export function deletePendingProposal(userId: number, proposalId: number) {
  return async (dispatch: Dispatch<any>) => {
    await dispatch({
      type: types.USER_DELETE_PROPOSAL,
      payload: deleteProposalDraft(proposalId).then(_ => ({ userId, proposalId })),
    });
  };
}

export function publishPendingProposal(userId: number, proposalId: number) {
  return async (dispatch: Dispatch<any>) => {
    await dispatch({
      type: types.USER_PUBLISH_PROPOSAL,
      payload: putProposalPublish(proposalId).then(res => ({
        userId,
        proposalId,
        proposal: res.data,
      })),
    });
  };
}

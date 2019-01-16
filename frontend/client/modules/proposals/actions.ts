import types from './types';
import {
  getProposals,
  getProposal,
  getProposalComments,
  getProposalUpdates,
  getProposalContributions,
  postProposalComment as apiPostProposalComment,
} from 'api/api';
import { Dispatch } from 'redux';
import { Proposal, Comment } from 'types';

export type TFetchProposals = typeof fetchProposals;
export function fetchProposals() {
  return async (dispatch: Dispatch<any>) => {
    return dispatch({
      type: types.PROPOSALS_DATA,
      payload: async () => {
        return (await getProposals()).data;
      },
    });
  };
}

export type TFetchProposal = typeof fetchProposal;
export function fetchProposal(proposalId: Proposal['proposalId']) {
  return async (dispatch: Dispatch<any>) => {
    return dispatch({
      type: types.PROPOSAL_DATA,
      payload: async () => {
        return (await getProposal(proposalId)).data;
      },
    });
  };
}

export function fetchProposalComments(proposalId: Proposal['proposalId']) {
  return (dispatch: Dispatch<any>) => {
    dispatch({
      type: types.PROPOSAL_COMMENTS,
      payload: getProposalComments(proposalId),
    });
  };
}

export function fetchProposalUpdates(proposalId: Proposal['proposalId']) {
  return (dispatch: Dispatch<any>) => {
    dispatch({
      type: types.PROPOSAL_UPDATES,
      payload: getProposalUpdates(proposalId).then(res => ({
        proposalId,
        updates: res.data,
      })),
    });
  };
}

export function fetchProposalContributions(proposalId: Proposal['proposalId']) {
  return (dispatch: Dispatch<any>) => {
    dispatch({
      type: types.PROPOSAL_CONTRIBUTIONS,
      payload: getProposalContributions(proposalId).then(res => ({
        proposalId,
        ...res.data,
      })),
    });
  };
}

export function postProposalComment(
  proposalId: Proposal['proposalId'],
  comment: string,
  parentCommentId?: Comment['id'],
) {
  return async (dispatch: Dispatch<any>) => {
    dispatch({ type: types.POST_PROPOSAL_COMMENT_PENDING });

    try {
      const res = await apiPostProposalComment({
        proposalId,
        parentCommentId,
        comment,
      });

      dispatch({
        type: types.POST_PROPOSAL_COMMENT_FULFILLED,
        payload: {
          proposalId,
          parentCommentId,
          comment: res.data,
        },
      });
    } catch (err) {
      dispatch({
        type: types.POST_PROPOSAL_COMMENT_REJECTED,
        payload: err.message || err.toString(),
        error: true,
      });
    }
  };
}

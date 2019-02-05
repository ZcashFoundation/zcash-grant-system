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
import { Proposal, Comment, ProposalPageParams } from 'types';
import { AppState } from 'store/reducers';
import { getProposalPageSettings } from './selectors';

type GetState = () => AppState;

// change page, sort, filter, search
export function setProposalPage(pageParams: Partial<ProposalPageParams>) {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    // 1. set page changes on state
    await dispatch({
      type: types.SET_PROPOSAL_PAGE,
      payload: pageParams,
    });
    // 2. get full updated page settings
    const page = getProposalPageSettings(getState());
    // 3. fetch proposals list with new settings
    return dispatch({
      type: types.PROPOSALS_DATA,
      payload: async () => {
        return (await getProposals(page)).data;
      },
    });
  };
}

export type TFetchProposals = typeof fetchProposals;
export function fetchProposals() {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    const page = getProposalPageSettings(getState());
    return dispatch({
      type: types.PROPOSALS_DATA,
      payload: async () => {
        return (await getProposals(page)).data;
      },
    });
  };
}

export type TFetchProposal = typeof fetchProposal;
export function fetchProposal(proposalId: Proposal['proposalId']) {
  return async (dispatch: Dispatch<any>) => {
    dispatch({
      type: types.PROPOSAL_DATA_PENDING,
      payload: { proposalId },
    });
    try {
      const proposal = (await getProposal(proposalId)).data;
      return dispatch({
        type: types.PROPOSAL_DATA_FULFILLED,
        payload: proposal,
      });
    } catch (error) {
      dispatch({
        type: types.PROPOSAL_DATA_REJECTED,
        payload: error,
      });
    }
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

import types from './types';
import {
  getProposals,
  getProposal,
  getProposalComments,
  getProposalUpdates,
  reportProposalComment as apiReportProposalComment,
  getProposalContributions,
  postProposalComment as apiPostProposalComment,
  requestProposalPayout,
  acceptProposalPayout,
  rejectProposalPayout,
} from 'api/api';
import { Dispatch } from 'redux';
import { Proposal, Comment, ProposalPageParams } from 'types';
import { AppState } from 'store/reducers';
import { getProposalPageSettings, getProposalCommentPageParams } from './selectors';

type GetState = () => AppState;

function addProposalUserRoles(p: Proposal, state: AppState) {
  if (state.auth.user) {
    const authUserId = state.auth.user.userid;
    if (p.arbiter.user) {
      p.isArbiter = p.arbiter.user.userid === authUserId;
    }
    if (p.team.find(t => t.userid === authUserId)) {
      p.isTeamMember = true;
    }
  }
  return p;
}

export function requestPayout(proposalId: number, milestoneId: number) {
  return async (dispatch: Dispatch<any>) => {
    return dispatch({
      type: types.PROPOSAL_PAYOUT_REQUEST,
      payload: async () => {
        return (await requestProposalPayout(proposalId, milestoneId)).data;
      },
    });
  };
}

export function acceptPayout(proposalId: number, milestoneId: number) {
  return async (dispatch: Dispatch<any>) => {
    return dispatch({
      type: types.PROPOSAL_PAYOUT_ACCEPT,
      payload: async () => {
        return (await acceptProposalPayout(proposalId, milestoneId)).data;
      },
    });
  };
}

export function rejectPayout(proposalId: number, milestoneId: number, reason: string) {
  return async (dispatch: Dispatch<any>) => {
    return dispatch({
      type: types.PROPOSAL_PAYOUT_REJECT,
      payload: async () => {
        return (await rejectProposalPayout(proposalId, milestoneId, reason)).data;
      },
    });
  };
}

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
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    dispatch({
      type: types.PROPOSAL_DATA_PENDING,
      payload: { proposalId },
    });
    try {
      const proposal = (await getProposal(proposalId)).data;
      return dispatch({
        type: types.PROPOSAL_DATA_FULFILLED,
        payload: addProposalUserRoles(proposal, getState()),
      });
    } catch (error) {
      dispatch({
        type: types.PROPOSAL_DATA_REJECTED,
        payload: error,
      });
    }
  };
}

export function fetchProposalComments(id?: number) {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    const state = getState();
    if (!state.proposal.detail) {
      return;
    }
    const proposalId = id || state.proposal.detail.proposalId;
    dispatch({
      type: types.PROPOSAL_COMMENTS_PENDING,
      payload: {
        parentId: proposalId, // payload gets the proposalId
      },
    });
    // get fresh params after PENDING has run, above
    const params = getProposalCommentPageParams(getState());
    try {
      const comments = (await getProposalComments(proposalId, params)).data;
      return dispatch({
        type: types.PROPOSAL_COMMENTS_FULFILLED,
        payload: comments,
      });
    } catch (error) {
      dispatch({
        type: types.PROPOSAL_COMMENTS_REJECTED,
        payload: error,
      });
    }
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

export function reportProposalComment(
  proposalId: Proposal['proposalId'],
  commentId: Comment['id'],
) {
  return async (dispatch: Dispatch<any>) => {
    dispatch({ type: types.REPORT_PROPOSAL_COMMENT_PENDING, payload: { commentId } });

    try {
      await apiReportProposalComment(proposalId, commentId);
      return dispatch({
        type: types.REPORT_PROPOSAL_COMMENT_FULFILLED,
        payload: {
          commentId,
        },
      });
    } catch (err) {
      return dispatch({
        type: types.REPORT_PROPOSAL_COMMENT_REJECTED,
        payload: err.message || err.toString(),
        error: true,
      });
    }
  };
}

export function updateProposalComment(
  commentId: Comment['id'],
  commentUpdate: Partial<Comment>,
) {
  return (dispatch: Dispatch<any>) =>
    dispatch({
      type: types.UPDATE_PROPOSAL_COMMENT,
      payload: {
        commentId,
        commentUpdate,
      },
    });
}

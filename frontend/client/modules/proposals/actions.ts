import types from './types';
import {
  getProposals,
  getProposal,
  getProposalComments,
  getProposalUpdates,
} from 'api/api';
import { Dispatch } from 'redux';
import { ProposalWithCrowdFund, Comment } from 'types';
import { signData } from 'modules/web3/actions';

export type TFetchProposals = typeof fetchProposals;
export function fetchProposals() {
  return (dispatch: Dispatch<any>) => {
    return dispatch({
      type: types.PROPOSALS_DATA,
      payload: async () => {
        return (await getProposals()).data;
      },
    });
  };
}

export type TFetchProposal = typeof fetchProposal;
export function fetchProposal(proposalId: ProposalWithCrowdFund['proposalId']) {
  return (dispatch: Dispatch<any>) => {
    dispatch({
      type: types.PROPOSAL_DATA,
      payload: async () => {
        return (await getProposal(proposalId)).data;
      },
    });
  };
}

export function fetchProposalComments(proposalId: ProposalWithCrowdFund['proposalId']) {
  return (dispatch: Dispatch<any>) => {
    dispatch({
      type: types.PROPOSAL_COMMENTS,
      payload: getProposalComments(proposalId),
    });
  };
}

export function fetchProposalUpdates(proposalId: ProposalWithCrowdFund['proposalId']) {
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

export function postProposalComment(
  proposalId: ProposalWithCrowdFund['proposalId'],
  comment: string,
  parentCommentId?: Comment['commentId'],
) {
  return async (dispatch: Dispatch<any>) => {
    dispatch({ type: types.POST_PROPOSAL_COMMENT_PENDING });

    try {
      const signedComment = await dispatch(
        signData(
          { comment },
          {
            comment: {
              name: 'Comment',
              type: 'string',
            },
          },
          'comment',
        ),
      );

      // TODO: API up the comment & signed comment, handle response / failures
      // TODO: Remove console log
      console.log(signedComment);
      dispatch({
        type: types.POST_PROPOSAL_COMMENT_FULFILLED,
        payload: {
          proposalId,
          parentCommentId,
          comment: {
            commentId: Math.random(),
            body: comment,
            dateCreated: Date.now(),
            replies: [],
            author: {
              accountAddress: '0x0',
              userid: 'test',
              username: 'test',
              title: 'test',
              avatar: { '120x120': 'test' },
            },
          },
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

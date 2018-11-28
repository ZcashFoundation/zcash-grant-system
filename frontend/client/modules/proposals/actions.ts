import types from './types';
import {
  getProposals,
  getProposal,
  getProposalComments,
  getProposalUpdates,
  postProposalContribution as apiPostProposalContribution,
  postProposalComment as apiPostProposalComment,
} from 'api/api';
import { Dispatch } from 'redux';
import { ProposalWithCrowdFund, Comment, AuthSignatureData } from 'types';
import { signData } from 'modules/web3/actions';

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
export function fetchProposal(proposalId: ProposalWithCrowdFund['proposalId']) {
  return async (dispatch: Dispatch<any>) => {
    return dispatch({
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
  parentCommentId?: Comment['id'],
) {
  return async (dispatch: Dispatch<any>) => {
    dispatch({ type: types.POST_PROPOSAL_COMMENT_PENDING });

    try {
      const sigData: AuthSignatureData = (await dispatch(
        signData(
          { comment },
          {
            comment: [
              {
                name: 'Comment',
                type: 'string',
              },
            ],
          },
          'comment',
        ),
      )) as any;

      const res = await apiPostProposalComment({
        proposalId,
        parentCommentId,
        comment,
        signedMessage: sigData.signedMessage,
        rawTypedData: JSON.stringify(sigData.rawTypedData),
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

export function postProposalContribution(
  proposalId: number,
  txId: string,
  account: string,
  amount: string,
) {
  return async (dispatch: Dispatch<any>) => {
    await dispatch({
      type: types.POST_PROPOSAL_CONTRIBUTION,
      payload: apiPostProposalContribution(proposalId, txId, account, amount),
    });
  };
}

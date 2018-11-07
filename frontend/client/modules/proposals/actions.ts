import types from './types';
import {
  getProposals,
  getProposal,
  getProposalComments,
  getProposalUpdates,
} from 'api/api';
import { Dispatch } from 'redux';
import Web3 from 'web3';
import { ProposalWithCrowdFund, Proposal, Comment } from 'types';
import { signData } from 'modules/web3/actions';
import getContract from 'lib/getContract';
import CrowdFund from 'lib/contracts/CrowdFund.json';
import { getCrowdFundState } from 'web3interact/crowdFund';

async function getMergedCrowdFundProposal(
  proposal: Proposal,
  web3: Web3,
  account: string,
) {
  const crowdFundContract = await getContract(web3, CrowdFund, proposal.proposalAddress);
  const crowdFundData = {
    crowdFundContract,
    crowdFund: await getCrowdFundState(crowdFundContract, account, web3),
  };

  for (let i = 0; i < crowdFundData.crowdFund.milestones.length; i++) {
    proposal.milestones[i] = {
      ...proposal.milestones[i],
      ...crowdFundData.crowdFund.milestones[i],
    };
  }

  return {
    ...crowdFundData,
    ...proposal,
  };
}

// valid as defined by crowdFund contract existing on current network
export async function getValidProposals(
  proposals: { data: Proposal[] },
  web3: Web3,
  account: string,
) {
  return (await Promise.all(
    proposals.data.map(async (proposal: Proposal) => {
      try {
        return await getMergedCrowdFundProposal(proposal, web3, account);
      } catch (e) {
        console.error('Could not lookup crowdFund contract', e);
      }
    }),
    // remove proposals that except since they cannot be retrieved via getContract
  )).filter(Boolean);
}

export type TFetchProposals = typeof fetchProposals;
export function fetchProposals() {
  return (dispatch: Dispatch<any>, getState: any) => {
    const state = getState();
    return dispatch({
      type: types.PROPOSALS_DATA,
      payload: async () => {
        const proposals = await getProposals();
        return getValidProposals(proposals, state.web3.web3, state.web3.accounts[0]);
      },
    });
  };
}

export type TFetchProposal = typeof fetchProposal;
export function fetchProposal(proposalId: ProposalWithCrowdFund['proposalId']) {
  return (dispatch: Dispatch<any>, getState: any) => {
    const state = getState();
    dispatch({
      type: types.PROPOSAL_DATA,
      payload: async () => {
        const proposal = await getProposal(proposalId);
        return await getMergedCrowdFundProposal(
          proposal.data,
          state.web3.web3,
          state.web3.accounts[0],
        );
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

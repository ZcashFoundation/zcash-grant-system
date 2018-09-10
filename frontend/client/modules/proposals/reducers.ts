import BN from 'bn.js';
import types from './types';
import { PROPOSAL_CATEGORY } from 'api/constants';

export interface User {
  accountAddress: string;
  userid: number | string;
  username: string;
  title: string;
  avatar: {
    '120x120': string;
  };
}

export interface Contributor {
  address: string;
  contributionAmount: string;
  refundVote: boolean;
  proportionalContribution: string;
  milestoneNoVotes: boolean[];
}

export enum MILESTONE_STATE {
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

export interface Milestone {
  index: number;
  state: MILESTONE_STATE;
  amount: BN;
  amountAgainstPayout: BN;
  percentAgainstPayout: number;
  payoutRequestVoteDeadline: number;
  isPaid: boolean;
  isImmediatePayout: boolean;
}

// TODO - have backend camelCase keys before response
export interface ProposalMilestone extends Milestone {
  body: string;
  content: string;
  dateCreated: Date;
  dateEstimated: Date;
  immediatePayout: boolean;
  payoutPercent: string;
  stage: string;
  title: string;
}

export interface CrowdFund {
  immediateFirstMilestonePayout: boolean;
  funded: number;
  target: number;
  beneficiary: string;
  deadline: number;
  trustees: string[];
  contributors: Contributor[];
  milestones: Milestone[];
  milestoneVotingPeriod: number;
  isFrozen: boolean;
  isRaiseGoalReached: boolean;
}

export interface Proposal {
  proposalId: string;
  dateCreated: number;
  title: string;
  body: string;
  stage: string;
  category: PROPOSAL_CATEGORY;
  milestones: ProposalMilestone[];
  team: User[];
}

export interface ProposalWithCrowdFund extends Proposal {
  crowdFund: CrowdFund | null;
  crowdFundContract: any;
}

export interface Comment {
  commentId: number | string;
  body: string;
  dateCreated: number;
  author: User;
  replies: Comment[];
}

export interface ProposalComments {
  proposalId: ProposalWithCrowdFund['proposalId'];
  totalComments: number;
  comments: Comment[];
}

export interface Update {
  updateId: number | string;
  title: string;
  body: string;
  dateCreated: number;
  totalComments: number;
}

export interface ProposalUpdates {
  proposalId: ProposalWithCrowdFund['proposalId'];
  totalUpdates: number;
  updates: Update[];
}

export interface ProposalState {
  proposals: ProposalWithCrowdFund[];
  proposalsError: null | string;
  isFetchingProposals: boolean;

  proposalComments: { [id: string]: ProposalComments };
  commentsError: null | string;
  isFetchingComments: boolean;

  proposalUpdates: { [id: string]: ProposalUpdates };
  updatesError: null | string;
  isFetchingUpdates: boolean;
}

export const INITIAL_STATE: ProposalState = {
  proposals: [],
  proposalsError: null,
  isFetchingProposals: false,

  proposalComments: {},
  commentsError: null,
  isFetchingComments: false,

  proposalUpdates: {},
  updatesError: null,
  isFetchingUpdates: false,
};

function addProposal(state: ProposalState, payload: ProposalWithCrowdFund) {
  let proposals = state.proposals;

  const existingProposal = state.proposals.find(
    (p: ProposalWithCrowdFund) => p.proposalId === payload.proposalId,
  );

  if (!existingProposal) {
    proposals = proposals.concat(payload);
  } else {
    proposals = [...proposals];
    const index = proposals.indexOf(existingProposal);
    proposals[index] = payload;
  }

  return {
    ...state,
    ...{
      proposals,
    },
  };
}

function addProposals(state: ProposalState, payload: ProposalWithCrowdFund[]) {
  return {
    ...state,
    proposals: payload,
    isFetchingProposals: false,
  };
}

function addComments(state: ProposalState, payload: { data: ProposalComments }) {
  return {
    ...state,
    proposalComments: {
      ...state.proposalComments,
      [payload.data.proposalId]: payload.data,
    },
    isFetchingComments: false,
  };
}

function addUpdates(state: ProposalState, payload: { data: ProposalUpdates }) {
  return {
    ...state,
    proposalUpdates: {
      ...state.proposalUpdates,
      [payload.data.proposalId]: payload.data,
    },
    isFetchingUpdates: false,
  };
}

export default (state = INITIAL_STATE, action: any) => {
  const { payload } = action;
  switch (action.type) {
    case types.PROPOSALS_DATA_PENDING:
      return {
        ...state,
        proposals: [],
        proposalsError: null,
        isFetchingProposals: true,
      };
    case types.PROPOSALS_DATA_FULFILLED:
      return addProposals(state, payload);
    case types.PROPOSALS_DATA_REJECTED:
      return {
        ...state,
        // TODO: Get action to send real error
        proposalsError: 'Failed to fetch proposal',
        isFetchingProposals: false,
      };

    case types.PROPOSAL_DATA_FULFILLED:
      return addProposal(state, payload);

    case types.PROPOSAL_COMMENTS_PENDING:
      return {
        ...state,
        commentsError: null,
        isFetchingComments: true,
      };
    case types.PROPOSAL_COMMENTS_FULFILLED:
      return addComments(state, payload);
    case types.PROPOSAL_COMMENTS_REJECTED:
      return {
        ...state,
        // TODO: Get action to send real error
        commentsError: 'Failed to fetch comments',
        isFetchingComments: false,
      };

    case types.PROPOSAL_UPDATES_PENDING:
      return {
        ...state,
        updatesError: null,
        isFetchingUpdates: true,
      };
    case types.PROPOSAL_UPDATES_FULFILLED:
      return addUpdates(state, payload);
    case types.PROPOSAL_UPDATES_REJECTED:
      return {
        ...state,
        // TODO: Get action to send real error
        updatesError: 'Failed to fetch updates',
        isFetchingUpdates: false,
      };

    default:
      return state;
  }
};

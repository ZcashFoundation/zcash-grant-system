import { Wei } from 'utils/units';
import { PROPOSAL_CATEGORY } from 'api/constants';
import {
  CreateMilestone,
  ProposalMilestone,
  Update,
  User,
  Milestone,
  Comment,
} from 'types';

export interface TeamInvite {
  id: number;
  dateCreated: number;
  address: string;
  accepted: boolean | null;
}

export interface Contributor {
  address: string;
  contributionAmount: Wei;
  refundVote: boolean;
  refunded: boolean;
  proportionalContribution: string;
  milestoneNoVotes: boolean[];
}

export interface CrowdFund {
  immediateFirstMilestonePayout: boolean;
  balance: Wei;
  funded: Wei;
  percentFunded: number;
  target: Wei;
  amountVotingForRefund: Wei;
  percentVotingForRefund: number;
  beneficiary: string;
  deadline: number;
  trustees: string[];
  contributors: Contributor[];
  milestones: Milestone[];
  milestoneVotingPeriod: number;
  isFrozen: boolean;
  isRaiseGoalReached: boolean;
}

export interface ProposalDraft {
  proposalId: number;
  dateCreated: number;
  title: string;
  brief: string;
  category: PROPOSAL_CATEGORY;
  content: string;
  stage: string;
  target: string;
  payoutAddress: string;
  trustees: string[];
  deadlineDuration: number;
  voteDuration: number;
  milestones: CreateMilestone[];
  team: User[];
  invites: TeamInvite[];
}

export interface Proposal {
  proposalId: number;
  proposalAddress: string;
  proposalUrlId: string;
  dateCreated: number;
  title: string;
  brief: string;
  content: string;
  stage: string;
  category: PROPOSAL_CATEGORY;
  milestones: ProposalMilestone[];
  team: User[];
}

export interface ProposalWithCrowdFund extends Proposal {
  crowdFund: CrowdFund;
}

export interface TeamInviteWithProposal extends TeamInvite {
  proposal: Proposal;
}

export interface ProposalComments {
  proposalId: ProposalWithCrowdFund['proposalId'];
  totalComments: number;
  comments: Comment[];
}

export interface ProposalUpdates {
  proposalId: ProposalWithCrowdFund['proposalId'];
  updates: Update[];
}

export interface UserProposal {
  proposalId: number;
  title: string;
  brief: string;
  team: User[];
  funded: Wei;
  target: Wei;
}

import { TeamMember } from 'types';
import { Wei } from 'utils/units';
import { PROPOSAL_CATEGORY } from 'api/constants';
import { Comment } from 'types';
import { Milestone, ProposalMilestone, Update } from 'types';

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

export interface Proposal {
  proposalId: string;
  dateCreated: number;
  title: string;
  body: string;
  stage: string;
  category: PROPOSAL_CATEGORY;
  milestones: ProposalMilestone[];
  team: TeamMember[];
}

export interface ProposalWithCrowdFund extends Proposal {
  crowdFund: CrowdFund | null;
  crowdFundContract: any;
}

export interface ProposalComments {
  proposalId: ProposalWithCrowdFund['proposalId'];
  totalComments: number;
  comments: Comment[];
}

export interface ProposalUpdates {
  proposalId: ProposalWithCrowdFund['proposalId'];
  totalUpdates: number;
  updates: Update[];
}

export interface UserProposal {
  proposalId: string;
  title: string;
  brief: string;
  team: TeamMember[];
  funded: Wei;
  target: Wei;
}

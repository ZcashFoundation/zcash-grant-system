import { Wei } from 'utils/units';
import { PROPOSAL_CATEGORY } from 'api/constants';
import { CreateMilestone, ProposalMilestone, Update, User, Comment } from 'types';

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
  deadlineDuration: number;
  milestones: CreateMilestone[];
  team: User[];
  invites: TeamInvite[];
  status: STATUS;
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

export interface TeamInviteWithProposal extends TeamInvite {
  proposal: Proposal;
}

export interface ProposalComments {
  proposalId: Proposal['proposalId'];
  totalComments: number;
  comments: Comment[];
}

export interface ProposalUpdates {
  proposalId: Proposal['proposalId'];
  updates: Update[];
}

export interface UserProposal {
  proposalId: number;
  status: STATUS;
  title: string;
  brief: string;
  target: Wei; // TODO - zcashify
  funded: Wei; // TODO - zcashify
  dateCreated: number;
  dateApproved: number;
  datePublished: number;
  team: User[];
  rejectReason: string;
}

// NOTE: sync with backend/grant/proposal/models.py STATUSES
export enum STATUS {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  LIVE = 'LIVE',
  DELETED = 'DELETED',
}

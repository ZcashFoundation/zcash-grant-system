import BN from 'bn.js';
import { Zat } from 'utils/units';
import { PROPOSAL_CATEGORY } from 'api/constants';
import { CreateMilestone, Update, User, Comment } from 'types';
import { ProposalMilestone } from './milestone';

export interface TeamInvite {
  id: number;
  dateCreated: number;
  address: string;
  accepted: boolean | null;
}

export interface Contributor {
  address: string;
  contributionAmount: Zat;
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

export interface Proposal extends Omit<ProposalDraft, 'target' | 'invites'> {
  proposalAddress: string;
  proposalUrlId: string;
  target: BN;
  funded: BN;
  percentFunded: number;
  milestones: ProposalMilestone[];
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
  funded: BN;
  target: BN;
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

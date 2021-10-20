import { Zat, Usd } from 'utils/units';
import { PROPOSAL_STAGE } from 'api/constants';
import {
  CreateMilestone,
  Update,
  Revision,
  User,
  Comment,
  ContributionWithUser,
} from 'types';
import { ProposalMilestone } from './milestone';
import { RFP } from './rfp';

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

export interface ProposalArbiter {
  user?: User; // only set if there is nomination/acceptance
  proposal: Proposal;
  status: PROPOSAL_ARBITER_STATUS;
}

export type ProposalProposalArbiter = Omit<ProposalArbiter, 'proposal'>;
export type UserProposalArbiter = Omit<ProposalArbiter, 'user'>;

export interface ProposalDraft {
  proposalId: number;
  dateCreated: number;
  title: string;
  brief: string;
  content: string;
  stage: PROPOSAL_STAGE;
  target: string;
  payoutAddress: string;
  milestones: CreateMilestone[];
  team: User[];
  invites: TeamInvite[];
  status: STATUS;
  isStaked: boolean;
  tipJarAddress: string | null;
  deadlineDuration?: number;
  rfp?: RFP;
  rfpOptIn?: boolean;
  postAgreementOptIn?: boolean;
}

export interface Proposal extends Omit<ProposalDraft, 'target' | 'invites'> {
  proposalAddress: string;
  proposalUrlId: string;
  target: Zat | Usd;
  funded: Zat | Usd;
  percentFunded: number;
  contributionMatching: number;
  contributionBounty: Zat;
  milestones: ProposalMilestone[];
  currentMilestone?: ProposalMilestone;
  datePublished: number | null;
  dateApproved: number | null;
  arbiter: ProposalProposalArbiter;
  acceptedWithFunding: boolean | null;
  isVersionTwo: boolean;
  authedFollows: boolean;
  followersCount: number;
  authedLiked: boolean;
  likesCount: number;
  tipJarViewKey: string | null;
  changesRequestedDiscussion: boolean | null;
  changesRequestedDiscussionReason: string | null;
  liveDraftId: string | null;
  isTeamMember?: boolean; // FE derived
  isArbiter?: boolean; // FE derived
  fundedByZomg: boolean;
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

export interface ProposalRevisions {
  proposalId: Proposal['proposalId'];
  revisions: Revision[];
}

export interface ProposalContributions {
  proposalId: Proposal['proposalId'];
  top: ContributionWithUser[];
  latest: ContributionWithUser[];
}

export interface UserProposal {
  proposalId: number;
  status: STATUS;
  title: string;
  brief: string;
  funded: Zat | Usd;
  target: Zat | Usd;
  dateCreated: number;
  dateApproved: number;
  datePublished: number;
  team: User[];
  rejectReason: string;
  changesRequestedDiscussionReason: string | null;
  acceptedWithFunding: boolean | null;
  isVersionTwo: boolean;
  fundedByZomg: boolean;
}

// NOTE: sync with backend/grant/proposal/models.py STATUSES
export enum STATUS {
  DRAFT = 'DRAFT',
  LIVE_DRAFT = 'LIVE_DRAFT',
  ARCHIVED = 'ARCHIVED',
  STAKING = 'STAKING',
  PENDING = 'PENDING',
  DISCUSSION = 'DISCUSSION',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REJECTED_PERMANENTLY = 'REJECTED_PERMANENTLY',
  LIVE = 'LIVE',
  DELETED = 'DELETED',
}

export enum PROPOSAL_ARBITER_STATUS {
  MISSING = 'MISSING',
  NOMINATED = 'NOMINATED',
  ACCEPTED = 'ACCEPTED',
}

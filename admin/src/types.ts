// backend
export interface SocialMedia {
  url: string;
  service: string;
  username: string;
}
// NOTE: sync with backend/grant/utils/enums.py MilestoneStage
export enum MILESTONE_STAGE {
  IDLE = 'IDLE',
  REQUESTED = 'REQUESTED',
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED',
  PAID = 'PAID',
}
export interface Milestone {
  id: number;
  index: number;
  content: string;
  dateCreated: number;
  dateEstimated?: number;
  daysEstimated?: string;
  dateRequested: number;
  dateAccepted: number;
  dateRejected: number;
  datePaid: number;
  immediatePayout: boolean;
  payoutPercent: string;
  stage: string;
  title: string;
}
// NOTE: sync with backend/grant/utils/enums.py RFPStatus
export enum RFP_STATUS {
  DRAFT = 'DRAFT',
  LIVE = 'LIVE',
  CLOSED = 'CLOSED',
}
export interface RFP {
  id: number;
  dateCreated: number;
  dateOpened: number | null;
  dateClosed: number | null;
  title: string;
  brief: string;
  content: string;
  status: string;
  proposals: Proposal[];
  matching: boolean;
  bounty: string | null;
  dateCloses: number | null;
  isVersionTwo: boolean;
}
export interface RFPArgs {
  title: string;
  brief: string;
  content: string;
  matching: boolean;
  dateCloses: number | null | undefined;
  bounty: string | null | undefined;
  status: string;
}
// NOTE: sync with backend/grant/utils/enums.py ProposalArbiterStatus
export enum PROPOSAL_ARBITER_STATUS {
  MISSING = 'MISSING',
  NOMINATED = 'NOMINATED',
  ACCEPTED = 'ACCEPTED',
}
export interface ProposalArbiter {
  user?: User;
  proposal: Proposal;
  status: PROPOSAL_ARBITER_STATUS;
}
// NOTE: sync with backend/grant/utils/enums.py ProposalStatus
export enum PROPOSAL_STATUS {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  LIVE = 'LIVE',
  DELETED = 'DELETED',
  STAKING = 'STAKING',
}
// NOTE: sync with backend/grant/utils/enums.py ProposalStage
export enum PROPOSAL_STAGE {
  PREVIEW = 'PREVIEW',
  FUNDING_REQUIRED = 'FUNDING_REQUIRED',
  WIP = 'WIP',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
  NOT_CANCELED = 'NOT_CANCELED',
}
export interface Proposal {
  proposalId: number;
  brief: string;
  status: PROPOSAL_STATUS;
  payoutAddress: string;
  dateCreated: number;
  dateApproved: number;
  datePublished: number;
  deadlineDuration: number;
  isFailed: boolean;
  title: string;
  content: string;
  stage: PROPOSAL_STAGE;
  milestones: Milestone[];
  currentMilestone?: Milestone;
  team: User[];
  comments: Comment[];
  target: string;
  contributed: string;
  funded: string;
  rejectReason: string;
  contributionMatching: number;
  contributionBounty: string;
  rfpOptIn: null | boolean;
  rfp?: RFP;
  arbiter: ProposalArbiter;
  acceptedWithFunding: boolean | null;
  isVersionTwo: boolean;
}
export interface Comment {
  id: number;
  userId: User['userid'];
  author?: User;
  proposalId: Proposal['proposalId'];
  proposal?: Proposal;
  dateCreated: number;
  content: string;
  hidden: boolean;
  reported: boolean;
}
export interface CommentArgs {
  hidden: boolean;
  reported: boolean;
}
// NOTE: sync with backend/utils/enums.py
export enum CONTRIBUTION_STATUS {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DELETED = 'DELETED',
}
export interface Contribution {
  id: number;
  status: CONTRIBUTION_STATUS;
  txId: null | string;
  amount: string;
  dateCreated: number;
  user: User | null;
  proposal: Proposal;
  addresses: {
    transparent: string;
    sprout: string;
    memo: string;
  };
  staking: boolean;
  private: boolean;
  refundAddress?: string;
  refundTxId?: string;
}
export interface ContributionArgs {
  proposalId?: string | number;
  userId?: string | number;
  amount?: string;
  status?: string;
  txId?: string;
  refundTxId?: string;
}
export interface User {
  accountAddress: string;
  avatar: null | { imageUrl: string };
  displayName: string;
  emailAddress: string;
  socialMedias: SocialMedia[];
  title: string;
  userid: number;
  proposals: Proposal[];
  comments: Comment[];
  contributions: Contribution[];
  silenced: boolean;
  banned: boolean;
  bannedReason: string;
  isAdmin: boolean;
}

export interface EmailExample {
  info: {
    subject: string;
    title: string;
    preview: string;
  };
  html: string;
  text: string;
}

export enum PROPOSAL_CATEGORY {
  DEV_TOOL = 'DEV_TOOL',
  CORE_DEV = 'CORE_DEV',
  COMMUNITY = 'COMMUNITY',
  DOCUMENTATION = 'DOCUMENTATION',
  ACCESSIBILITY = 'ACCESSIBILITY',
}

export interface PageQuery {
  page: number;
  filters: string[];
  search: string;
  sort: string;
}

export interface PageData<T> extends PageQuery {
  pageSize: number;
  total: number;
  items: T[];
  fetching: boolean;
  fetched: boolean;
}

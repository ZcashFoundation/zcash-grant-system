// backend
export interface SocialMedia {
  url: string;
  service: string;
  username: string;
}
export interface Milestone {
  content: string;
  dateCreated: string;
  dateEstimated: string;
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
  title: string;
  brief: string;
  content: string;
  category: string;
  status: string;
  proposals: Proposal[];
}
export interface RFPArgs {
  title: string;
  brief: string;
  content: string;
  category: string;
  status?: string;
}
// NOTE: sync with backend/grant/utils/enums.py ProposalStatus
export enum PROPOSAL_STATUS {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  LIVE = 'LIVE',
  DELETED = 'DELETED',
}
export interface Proposal {
  proposalId: number;
  brief: string;
  status: PROPOSAL_STATUS;
  proposalAddress: string;
  dateCreated: number;
  dateApproved: number;
  datePublished: number;
  title: string;
  content: string;
  stage: string;
  category: string;
  milestones: Milestone[];
  team: User[];
  comments: Comment[];
  contractStatus: string;
  target: string;
  contributed: string;
  funded: string;
  rejectReason: string;
  contributionMatching: number;
  rfp?: RFP;
}
export interface Comment {
  commentId: string;
  proposalId: Proposal['proposalId'];
  proposal?: Proposal;
  dateCreated: number;
  content: string;
}
export interface Contribution {
  id: number;
  status: string;
  txId: null | string;
  amount: string;
  dateCreated: number;
  user: User;
  proposal: Proposal;
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
  DAPP = 'DAPP',
  DEV_TOOL = 'DEV_TOOL',
  CORE_DEV = 'CORE_DEV',
  COMMUNITY = 'COMMUNITY',
  DOCUMENTATION = 'DOCUMENTATION',
  ACCESSIBILITY = 'ACCESSIBILITY',
}

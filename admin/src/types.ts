// backend
export interface SocialMedia {
  socialMediaLink: string;
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
// NOTE: sync with backend/grant/proposal/models.py STATUSES
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
  status: PROPOSAL_STATUS;
  proposalAddress: string;
  dateCreated: number;
  title: string;
  content: string;
  stage: string;
  category: string;
  milestones: Milestone[];
  team: User[];
  comments: Comment[];
  contractStatus: string;
}
export interface Comment {
  commentId: string;
  dateCreated: string;
  content: string;
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
}

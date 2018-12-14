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
export interface Proposal {
  proposalId: number;
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

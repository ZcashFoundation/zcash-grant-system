import { UserProposal, User } from 'types';

export interface Comment {
  proposalId: number;
  commentId: number;
  body: string;
  dateCreated: number;
  author: User;
  replies: Comment[];
}

export interface UserComment {
  commentId: number | string;
  body: string;
  dateCreated: number;
  proposal: UserProposal;
}

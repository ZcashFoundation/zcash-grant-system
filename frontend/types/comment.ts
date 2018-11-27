import { UserProposal, User } from 'types';

export interface Comment {
  id: number;
  proposalId: number;
  content: string;
  dateCreated: number;
  author: User;
  replies: Comment[];
}

export interface UserComment {
  commentId: number | string;
  content: string;
  dateCreated: number;
  proposal: UserProposal;
}

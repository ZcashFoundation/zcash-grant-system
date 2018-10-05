import { User, UserProposal } from 'types';

export interface Comment {
  commentId: number | string;
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

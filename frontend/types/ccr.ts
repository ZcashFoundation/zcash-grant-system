import { User } from 'types/user';
import { RFP } from 'types/rfp';

export enum CCRSTATUS {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  LIVE = 'LIVE',
  DELETED = 'DELETED',
}

export interface CCRDraft {
  author: User;
  title: string;
  brief: string;
  ccrId: number;
  status: CCRSTATUS;
  target: string;
  dateCreated: number;
  content: string;
}

export interface CCR extends CCRDraft {
  rfp?: RFP;
}

export interface UserCCR {
  author: User;
  ccrId: number;
  status: CCRSTATUS;
  title: string;
  brief: string;
  dateCreated: number;
  dateApproved: number;
  datePublished: number;
  rejectReason: string;
}

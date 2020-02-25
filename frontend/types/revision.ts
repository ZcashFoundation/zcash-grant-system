import { User } from 'types';

export enum REVISION_CHANGE_TYPES {
  PROPOSAL_EDIT_BRIEF = 'PROPOSAL_EDIT_BRIEF',
  PROPOSAL_EDIT_CONTENT = 'PROPOSAL_EDIT_CONTENT',
  PROPOSAL_EDIT_TARGET = 'PROPOSAL_EDIT_TARGET',
  PROPOSAL_EDIT_TITLE = 'PROPOSAL_EDIT_TITLE',
  MILESTONE_ADD = 'MILESTONE_ADD',
  MILESTONE_REMOVE = 'MILESTONE_REMOVE',
  MILESTONE_EDIT_AMOUNT = 'MILESTONE_EDIT_AMOUNT',
  MILESTONE_EDIT_DAYS = 'MILESTONE_EDIT_DAYS',
  MILESTONE_EDIT_IMMEDIATE_PAYOUT = 'MILESTONE_EDIT_IMMEDIATE_PAYOUT',
  MILESTONE_EDIT_PERCENT = 'MILESTONE_EDIT_PERCENT',
  MILESTONE_EDIT_CONTENT = 'MILESTONE_EDIT_CONTENT',
  MILESTONE_EDIT_TITLE = 'MILESTONE_EDIT_TITLE',
}

export interface RevisionChange {
  type: REVISION_CHANGE_TYPES;
  milestoneIndex?: number;
}

export interface Revision {
  revisionId: string;
  dateCreated: number;
  author: User;
  proposalId: string;
  proposalArchiveId: string;
  proposalArchiveParentId: string;
  changes: RevisionChange[];
  revisionIndex: number;
}

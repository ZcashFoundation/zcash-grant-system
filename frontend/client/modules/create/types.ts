import { PROPOSAL_CATEGORY } from 'api/constants';
import { SocialAccountMap } from 'utils/social';

enum CreateTypes {
  UPDATE_FORM = 'UPDATE_FORM',

  RESET_FORM = 'RESET_FORM',

  SAVE_DRAFT = 'SAVE_DRAFT',
  SAVE_DRAFT_PENDING = 'SAVE_DRAFT_PENDING',
  SAVE_DRAFT_FULFILLED = 'SAVE_DRAFT_FULFILLED',
  SAVE_DRAFT_REJECTED = 'SAVE_DRAFT_REJECTED',

  FETCH_DRAFT = 'FETCH_DRAFT',
  FETCH_DRAFT_PENDING = 'FETCH_DRAFT_PENDING',
  FETCH_DRAFT_FULFILLED = 'FETCH_DRAFT_FULFILLED',
  FETCH_DRAFT_REJECTED = 'FETCH_DRAFT_REJECTED',

  SUBMIT = 'CREATE_PROPOSAL',
  SUBMIT_PENDING = 'CREATE_PROPOSAL_PENDING',
  SUBMIT_FULFILLED = 'CREATE_PROPOSAL_FULFILLED',
  SUBMIT_REJECTED = 'CREATE_PROPOSAL_REJECTED',
}

export default CreateTypes;

export interface Milestone {
  title: string;
  description: string;
  date: string;
  payoutPercent: number;
  immediatePayout: boolean;
}

// TODO: Merge this or extend the `User` type in proposals/reducers.ts
export interface TeamMember {
  name: string;
  title: string;
  avatarUrl: string;
  ethAddress: string;
  emailAddress: string;
  socialAccounts: SocialAccountMap;
}

export interface CreateFormState {
  title: string;
  brief: string;
  category: PROPOSAL_CATEGORY | null;
  amountToRaise: string;
  details: string;
  payOutAddress: string;
  trustees: string[];
  milestones: Milestone[];
  team: TeamMember[];
  deadline: number | null;
  milestoneDeadline: number | null;
}

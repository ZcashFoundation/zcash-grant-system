import { Wei } from 'utils/units';

export enum MILESTONE_STATE {
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

export interface Milestone {
  index: number;
  state: MILESTONE_STATE;
  amount: Wei;
  amountAgainstPayout: Wei;
  percentAgainstPayout: number;
  payoutRequestVoteDeadline: number;
  isPaid: boolean;
  isImmediatePayout: boolean;
}

// TODO - have backend camelCase keys before response
export interface ProposalMilestone extends Milestone {
  body: string;
  content: string;
  immediatePayout: boolean;
  dateEstimated: string;
  payoutPercent: string;
  stage: string;
  title: string;
}

export interface CreateMilestone {
  title: string;
  description: string;
  date: string;
  payoutPercent: number;
  immediatePayout: boolean;
}

import { Zat } from 'utils/units';

export enum MILESTONE_STATE {
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

export interface Milestone {
  index: number;
  state: MILESTONE_STATE;
  amount: Zat;
  isPaid: boolean;
  isImmediatePayout: boolean;
}

export interface ProposalMilestone extends Milestone {
  content: string;
  immediatePayout: boolean;
  dateEstimated: string;
  payoutPercent: string;
  stage: string;
  title: string;
}

export interface CreateMilestone {
  title: string;
  content: string;
  dateEstimated: string;
  payoutPercent: string;
  immediatePayout: boolean;
}

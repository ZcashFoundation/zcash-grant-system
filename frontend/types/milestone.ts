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
  immediatePayout: boolean;
  dateEstimated: number;
}

export interface ProposalMilestone extends Milestone {
  content: string;
  payoutPercent: string;
  title: string;
}

export interface CreateMilestone {
  title: string;
  content: string;
  dateEstimated: number;
  payoutPercent: string;
  immediatePayout: boolean;
}

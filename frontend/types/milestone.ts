import { Zat } from 'utils/units';

export enum MILESTONE_STATE {
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

// NOTE: sync with /backend/grand/utils/enums.py MilestoneStage
export enum MILESTONE_STAGE {
  IDLE = 'IDLE',
  REQUESTED = 'REQUESTED',
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED',
  PAID = 'PAID',
}

export interface Milestone {
  index: number;
  stage: MILESTONE_STAGE;
  amount: Zat;
  immediatePayout: boolean;
  dateEstimated?: number;
  daysEstimated?: string;
  dateRequested?: number;
  dateRejected?: number;
  dateAccepted?: number;
  datePaid?: number;
  rejectReason?: string;
  paidTxId?: string;
}

export interface ProposalMilestone extends Milestone {
  id: number;
  content: string;
  payoutPercent: string;
  title: string;
}

export interface CreateMilestone {
  title: string;
  content: string;
  daysEstimated?: string;
  payoutPercent: string;
  immediatePayout: boolean;
}

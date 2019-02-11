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
  dateEstimated: number;
  dateRequested?: number;
  dateRejected?: number;
  dateAccepted?: number;
  datePaid?: number;
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

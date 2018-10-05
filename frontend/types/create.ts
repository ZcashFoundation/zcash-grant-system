import { PROPOSAL_CATEGORY } from 'api/constants';
import { TeamMember, CreateMilestone } from 'types';

export interface CreateFormState {
  title: string;
  brief: string;
  category: PROPOSAL_CATEGORY | null;
  amountToRaise: string;
  details: string;
  payOutAddress: string;
  trustees: string[];
  milestones: CreateMilestone[];
  team: TeamMember[];
  deadline: number | null;
  milestoneDeadline: number | null;
}

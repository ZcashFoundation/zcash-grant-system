import { Proposal } from './proposal';
import { PROPOSAL_CATEGORY, RFP_STATUS } from 'api/constants';

export interface RFP {
  id: number;
  dateCreated: number;
  title: string;
  brief: string;
  content: string;
  category: PROPOSAL_CATEGORY;
  status: RFP_STATUS;
  acceptedProposals: Proposal[];
}

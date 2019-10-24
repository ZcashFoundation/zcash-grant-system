import { Proposal } from './proposal';
import { PROPOSAL_CATEGORY, RFP_STATUS } from 'api/constants';
import { Zat } from 'utils/units';

export interface RFP {
  id: number;
  urlId: string;
  title: string;
  brief: string;
  content: string;
  category: PROPOSAL_CATEGORY;
  status: RFP_STATUS;
  acceptedProposals: Proposal[];
  bounty: Zat | null;
  matching: boolean;
  dateOpened: number;
  dateClosed?: number;
  dateCloses?: number;
  authedLiked: boolean;
  likesCount: number;
}

import { Proposal } from './proposal';
import { RFP_STATUS } from 'api/constants';
import { CCR } from 'types/ccr';
import { Zat, Usd } from 'utils/units';

export interface RFP {
  id: number;
  urlId: string;
  title: string;
  brief: string;
  content: string;
  status: RFP_STATUS;
  acceptedProposals: Proposal[];
  bounty: Zat | Usd | null;
  matching: boolean;
  dateOpened: number;
  dateClosed?: number;
  dateCloses?: number;
  authedLiked: boolean;
  likesCount: number;
  isVersionTwo: boolean;
  ccr?: CCR;
}

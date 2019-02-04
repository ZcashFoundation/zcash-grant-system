import { Proposal } from './proposal';
import { PROPOSAL_SORT } from 'api/constants';

export interface Page {
  page: number;
  pageSize: number;
  total: number;
  search: string;
  sort: PROPOSAL_SORT;
  filters: string[];
}

export type SettablePage = Omit<Page, 'pageSize' | 'total'>;

export interface LoadablePage extends Page {
  hasFetched: boolean;
  isFetching: boolean;
  fetchError: null | string;
  fetchTime: number;
}

export interface ProposalPage extends Page {
  items: Proposal[];
}

export type LoadableProposalPage = ProposalPage & LoadablePage;

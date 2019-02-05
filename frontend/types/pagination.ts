import { Proposal } from './proposal';
import { PROPOSAL_SORT, PROPOSAL_CATEGORY, PROPOSAL_STAGE } from 'api/constants';

export interface Page {
  page: number;
  pageSize: number;
  total: number;
  search: string;
  sort: string;
  filters: string[];
}

export type PageParams = Omit<Page, 'pageSize' | 'total'>;

export interface Loadable {
  hasFetched: boolean;
  isFetching: boolean;
  fetchError: null | string;
  fetchTime: number;
}

export interface ProposalPage extends Omit<Page, 'filters' | 'sort'> {
  items: Proposal[];
  sort: PROPOSAL_SORT;
  filters: {
    stage: PROPOSAL_STAGE[];
    category: PROPOSAL_CATEGORY[];
  };
}

export type LoadableProposalPage = ProposalPage & Loadable;

export type ProposalPageParams = Omit<ProposalPage, 'items' | 'pageSize' | 'total'>;

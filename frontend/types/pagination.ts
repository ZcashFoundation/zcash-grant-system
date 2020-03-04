import { Proposal } from './proposal';
import {
  PROPOSAL_SORT,
  PROPOSAL_CATEGORY,
  PROPOSAL_STAGE,
  CUSTOM_FILTERS,
} from 'api/constants';

export interface Page {
  page: number;
  pageSize: number;
  total: number;
  search: string;
  sort: string;
  filters: string[];
}

export interface ServerPage<T> extends Page {
  items: T[];
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
    custom: CUSTOM_FILTERS[];
  };
}

export type LoadablePage = Page & Loadable;

export type LoadableProposalPage = ProposalPage & Loadable;

export type ProposalPageParams = Omit<ProposalPage, 'items' | 'pageSize' | 'total'>;

export interface Moreable<T> extends LoadablePage {
  pages: T[][]; // ex: Comment
  hasMore: boolean;
  parentId: null | number; // ex: proposalId, parentCommentId... (optional)
}

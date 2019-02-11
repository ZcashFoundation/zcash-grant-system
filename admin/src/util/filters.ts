import {
  PROPOSAL_STATUSES,
  RFP_STATUSES,
  CONTRIBUTION_STATUSES,
  PROPOSAL_ARBITER_STATUSES,
} from './statuses';

export interface Filter {
  id: string;
  display: string;
  color: string;
  group: string;
}

export interface Filters {
  list: Filter[];
  getById: (id: string) => Filter;
}

const getFilterById = (from: Filter[]) => (id: string) => {
  const search = from.find(x => x.id === id);
  if (!search) {
    throw Error(`filter.getById: could not find filter for '${id}'`);
  }
  return search;
};

// Proposal

const PROPOSAL_FILTERS = PROPOSAL_STATUSES.map(s => ({
  id: `STATUS_${s.id}`,
  display: `Status: ${s.tagDisplay}`,
  color: s.tagColor,
  group: 'Status',
}))
  // proposal has extra filters
  .concat(
    PROPOSAL_ARBITER_STATUSES.map(s => ({
      id: `ARBITER_${s.id}`,
      display: `Arbiter: ${s.tagDisplay}`,
      color: s.tagColor,
      group: 'Arbiter',
    })),
  );

export const proposalFilters: Filters = {
  list: PROPOSAL_FILTERS,
  getById: getFilterById(PROPOSAL_FILTERS),
};

// RFP

const RFP_FILTERS = RFP_STATUSES.map(s => ({
  id: `STATUS_${s.id}`,
  display: `Status: ${s.tagDisplay}`,
  color: s.tagColor,
  group: 'Status',
}));

export const rfpFilters: Filters = {
  list: RFP_FILTERS,
  getById: getFilterById(RFP_FILTERS),
};

// Contribution

const CONTRIBUTION_FILTERS = CONTRIBUTION_STATUSES.map(s => ({
  id: `STATUS_${s.id}`,
  display: `Status: ${s.tagDisplay}`,
  color: s.tagColor,
  group: 'Status',
}));

export const contributionFilters: Filters = {
  list: CONTRIBUTION_FILTERS,
  getById: getFilterById(CONTRIBUTION_FILTERS),
};

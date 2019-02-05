import { AppState } from 'store/reducers';
import {
  Proposal,
  ProposalComments,
  ProposalUpdates,
  ProposalContributions,
  ProposalPageParams,
} from 'types';

export function getProposalComments(
  state: AppState,
  proposalId: Proposal['proposalId'],
): ProposalComments['comments'] | null {
  const pc = state.proposal.proposalComments[proposalId];
  return pc ? pc.comments : null;
}

export function getProposalCommentCount(
  state: AppState,
  proposalId: Proposal['proposalId'],
): ProposalComments['totalComments'] | null {
  const pc = state.proposal.proposalComments[proposalId];
  return pc ? pc.totalComments : null;
}

export function getIsFetchingComments(state: AppState) {
  return state.proposal.isFetchingComments;
}

export function getCommentsError(state: AppState) {
  return state.proposal.commentsError;
}

export function getProposalUpdates(
  state: AppState,
  proposalId: Proposal['proposalId'],
): ProposalUpdates['updates'] | null {
  const pu = state.proposal.proposalUpdates[proposalId];
  return pu ? pu.updates : null;
}

export function getProposalUpdateCount(
  state: AppState,
  proposalId: Proposal['proposalId'],
): number | null {
  const pu = state.proposal.proposalUpdates[proposalId];
  return pu ? pu.updates.length : null;
}

export function getIsFetchingUpdates(state: AppState) {
  return state.proposal.isFetchingUpdates;
}

export function getUpdatesError(state: AppState) {
  return state.proposal.updatesError;
}

export function getProposalContributions(
  state: AppState,
  proposalId: Proposal['proposalId'],
): Omit<ProposalContributions, 'proposalId'> | null {
  const pc = state.proposal.proposalContributions[proposalId];
  return pc ? { top: pc.top, latest: pc.latest } : null;
}

export function getIsFetchingContributions(state: AppState) {
  return state.proposal.isFetchingContributions;
}

export function getFetchContributionsError(state: AppState) {
  return state.proposal.fetchContributionsError;
}

export function getProposalPageSettings(state: AppState): ProposalPageParams {
  const { page, search, sort, filters } = state.proposal.page;
  return {
    page,
    search,
    sort,
    filters,
  };
}

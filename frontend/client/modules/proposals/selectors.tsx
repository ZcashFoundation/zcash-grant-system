import { AppState } from 'store/reducers';
import { ProposalWithCrowdFund, ProposalComments, ProposalUpdates } from 'types';

export function getProposals(state: AppState) {
  return state.proposal.proposals;
}

export function getProposal(
  state: AppState,
  proposalId: ProposalWithCrowdFund['proposalId'],
): ProposalWithCrowdFund | null {
  return (
    state.proposal.proposals.find(
      (p: ProposalWithCrowdFund) => p.proposalId === proposalId,
    ) || null
  );
}

export function getProposalComments(
  state: AppState,
  proposalId: ProposalWithCrowdFund['proposalId'],
): ProposalComments['comments'] | null {
  const pc = state.proposal.proposalComments[proposalId];
  return pc ? pc.comments : null;
}

export function getProposalCommentCount(
  state: AppState,
  proposalId: ProposalWithCrowdFund['proposalId'],
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
  proposalId: ProposalWithCrowdFund['proposalId'],
): ProposalUpdates['updates'] | null {
  const pu = state.proposal.proposalUpdates[proposalId];
  return pu ? pu.updates : null;
}

export function getProposalUpdateCount(
  state: AppState,
  proposalId: ProposalWithCrowdFund['proposalId'],
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

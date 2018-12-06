import { Store } from 'redux';
import { fetchUser } from 'modules/users/actions';
import { fetchProposals, fetchProposal } from 'modules/proposals/actions';
import { extractProposalIdFromUrl } from 'utils/api';

const pathActions = [
  {
    matcher: /^\/proposals$/,
    action: (_: RegExpMatchArray, store: Store) => {
      return store.dispatch<any>(fetchProposals());
    },
  },
  {
    matcher: /^\/proposals\/(.+)$/,
    action: (match: RegExpMatchArray, store: Store) => {
      const proposalId = extractProposalIdFromUrl(match[1]);
      if (proposalId) {
        return store.dispatch<any>(fetchProposal(proposalId));
      }
    },
  },
  {
    matcher: /^\/profile\/(.+)$/,
    action: (match: RegExpMatchArray, store: Store) => {
      const userId = match[1];
      if (userId) {
        return store.dispatch<any>(fetchUser(userId));
      }
    },
  },
];

export function storeActionsForPath(path: string, store: Store) {
  const pathAction = pathActions.find(pa => !!path.match(pa.matcher));
  if (pathAction) {
    const matches = path.match(pathAction.matcher);
    if (matches) {
      return pathAction.action(matches, store);
    }
  }
  return Promise.resolve();
}

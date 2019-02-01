import { Store } from 'redux';
import { fetchUser } from 'modules/users/actions';
import { fetchProposals, fetchProposal } from 'modules/proposals/actions';
import { fetchRfps, fetchRfp } from 'modules/rfps/actions';
import { extractIdFromSlug } from 'utils/api';

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
      const proposalId = extractIdFromSlug(match[1]);
      if (proposalId) {
        // return null for errors (404 most likely)
        return store.dispatch<any>(fetchProposal(proposalId)).catch(() => null);
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
  {
    matcher: /^\/requests$/,
    action: (_: RegExpMatchArray, store: Store) => {
      return store.dispatch<any>(fetchRfps());
    },
  },
  {
    matcher: /^\/requests\/(.+)$/,
    action: (match: RegExpMatchArray, store: Store) => {
      const rfpId = extractIdFromSlug(match[1]);
      if (rfpId) {
        // return null for errors (404 most likely)
        return store.dispatch<any>(fetchRfp(rfpId)).catch(() => null);
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

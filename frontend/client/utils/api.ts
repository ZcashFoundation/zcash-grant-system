import BN from 'bn.js';
import { User, Proposal, UserProposal } from 'types';
import { UserState } from 'modules/users/reducers';
import { AppState } from 'store/reducers';

export function formatUserForPost(user: User) {
  return {
    ...user,
    avatar: user.avatar ? user.avatar.imageUrl : null,
  };
}

export function formatUserFromGet(user: UserState) {
  const bnUserProp = (p: UserProposal) => {
    p.funded = new BN(p.funded);
    p.target = new BN(p.target);
    return p;
  };
  user.pendingProposals = user.pendingProposals.map(bnUserProp);
  user.createdProposals = user.createdProposals.map(bnUserProp);
  user.fundedProposals = user.fundedProposals.map(bnUserProp);
  return user;
}

export function formatProposalFromGet(proposal: Proposal) {
  proposal.proposalUrlId = generateProposalUrl(proposal.proposalId, proposal.title);
  return proposal;
}

// TODO: i18n on case-by-case basis
export function generateProposalUrl(id: number, title: string) {
  const slug = title
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[’'"]+/g, '')
    .replace(/[^\w\-]+/g, '-')
    .replace(/\-{2,}/g, '-')
    .replace(/^\-*|\-*$/g, '');
  return `${id}-${slug}`;
}

export function extractProposalIdFromUrl(slug: string) {
  const proposalId = parseInt(slug, 10);
  if (isNaN(proposalId)) {
    console.error('extractProposalIdFromUrl could not find id in : ' + slug);
  }
  return proposalId;
}

// pre-hydration massage (BNify JSONed BNs)
export function massageSerializedState(state: AppState) {
  // users
  const bnUserProp = (p: UserProposal) => {
    p.funded = new BN(p.funded, 16);
    p.target = new BN(p.target, 16);
    return p;
  };
  Object.values(state.users.map).forEach(user => {
    user.createdProposals.forEach(bnUserProp);
    user.fundedProposals.forEach(bnUserProp);
    user.comments.forEach(c => {
      c.proposal = bnUserProp(c.proposal);
    });
  });

  return state;
}

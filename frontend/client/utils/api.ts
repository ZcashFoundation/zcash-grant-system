import BN from 'bn.js';
import { User, Proposal, UserProposal, RFP, MILESTONE_STATE } from 'types';
import { UserState } from 'modules/users/reducers';
import { AppState } from 'store/reducers';
import { toZat } from './units';

export function formatUserForPost(user: User) {
  return {
    ...user,
    avatar: user.avatar ? user.avatar.imageUrl : null,
  };
}

export function formatUserFromGet(user: UserState) {
  const bnUserProp = (p: any) => {
    p.funded = toZat(p.funded);
    p.target = toZat(p.target);
    return p;
  };
  if (user.pendingProposals) {
    user.pendingProposals = user.pendingProposals.map(bnUserProp);
  }
  user.proposals = user.proposals.map(bnUserProp);
  user.contributions = user.contributions.map(c => {
    c.amount = toZat((c.amount as any) as string);
    return c;
  });
  return user;
}

export function formatProposalFromGet(p: any): Proposal {
  const proposal = { ...p } as Proposal;
  proposal.proposalUrlId = generateSlugUrl(proposal.proposalId, proposal.title);
  proposal.target = toZat(p.target);
  proposal.funded = toZat(p.funded);
  proposal.percentFunded = proposal.target.isZero()
    ? 0
    : proposal.funded.div(proposal.target.divn(100)).toNumber();
  if (proposal.milestones) {
    proposal.milestones = proposal.milestones.map((m: any, index: number) => {
      return {
        ...m,
        index,
        amount: proposal.target.mul(new BN(m.payoutPercent)).divn(100),
        // TODO: Get data from backend
        state: MILESTONE_STATE.WAITING,
        isPaid: false,
      };
    });
  }
  return proposal;
}

export function formatRFPFromGet(rfp: RFP): RFP {
  rfp.acceptedProposals = rfp.acceptedProposals.map(formatProposalFromGet);
  return rfp;
}

// TODO: i18n on case-by-case basis
export function generateSlugUrl(id: number, title: string) {
  const slug = title
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[’'"]+/g, '')
    .replace(/[^\w\-]+/g, '-')
    .replace(/\-{2,}/g, '-')
    .replace(/^\-*|\-*$/g, '');
  return `${id}-${slug}`;
}

export function extractIdFromSlug(slug: string) {
  const id = parseInt(slug, 10);
  if (isNaN(id)) {
    console.error('extractIdFromSlug could not find id in : ' + slug);
  }
  return id;
}

// pre-hydration massage (BNify JSONed BNs)
export function massageSerializedState(state: AppState) {
  // proposals
  state.proposal.proposals = state.proposal.proposals.map(p => ({
    ...p,
    target: new BN((p.target as any) as string, 16),
    funded: new BN((p.funded as any) as string, 16),
    milestones: p.milestones.map(m => ({
      ...m,
      amount: new BN((m.amount as any) as string, 16),
    })),
  }));
  // users
  const bnUserProp = (p: UserProposal) => {
    p.funded = new BN(p.funded, 16);
    p.target = new BN(p.target, 16);
    return p;
  };
  Object.values(state.users.map).forEach(user => {
    user.proposals = user.proposals.map(bnUserProp);
    user.contributions = user.contributions.map(c => {
      c.amount = new BN(c.amount, 16);
      return c;
    });
    user.comments = user.comments.map(c => {
      c.proposal = bnUserProp(c.proposal);
      return c;
    });
  });

  return state;
}

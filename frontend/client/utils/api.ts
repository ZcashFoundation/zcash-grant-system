import BN from 'bn.js';
import {
  User,
  Proposal,
  ProposalPageParams,
  PageParams,
  UserProposal,
  RFP,
  ProposalPage,
} from 'types';
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
  if (user.arbitrated) {
    user.arbitrated = user.arbitrated.map(a => {
      a.proposal = bnUserProp(a.proposal);
      return a;
    });
  }
  user.proposals = user.proposals.map(bnUserProp);
  user.contributions = user.contributions.map(c => {
    c.amount = toZat((c.amount as any) as string);
    return c;
  });
  return user;
}
// NOTE: sync with pagination.py ProposalPagination.SORT_MAP
const proposalsSortMap = {
  NEWEST: 'PUBLISHED:DESC',
  OLDEST: 'PUBLISHED:ASC',
};

export function formatProposalPageParamsForGet(params: ProposalPageParams): PageParams {
  return {
    ...params,
    sort: proposalsSortMap[params.sort],
    filters: [
      ...params.filters.category.map(c => 'CAT_' + c),
      ...params.filters.stage.map(s => 'STAGE_' + s),
    ],
  } as PageParams;
}

export function formatProposalPageFromGet(page: any): ProposalPage {
  page.items = page.items.map(formatProposalFromGet);
  const swf = (sw: string, a: string[]) =>
    a.filter(x => x.startsWith(sw)).map(x => x.replace(sw, ''));
  page.filters = {
    category: swf('CAT_', page.filters),
    stage: swf('STAGE_', page.filters),
  };
  // reverse map
  const serverSortToClient = Object.entries(proposalsSortMap).find(
    ([_, v]) => v === page.sort,
  );
  if (!serverSortToClient) {
    throw Error(
      `formatProposalFromGet Unable to find mapping from server proposal sort: ${
        page.sort
      }`,
    );
  }
  page.sort = serverSortToClient[0];
  return page as ProposalPage;
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
    const msToFe = (m: any) => ({
      ...m,
      amount: proposal.target.mul(new BN(m.payoutPercent)).divn(100),
    });
    proposal.milestones = proposal.milestones.map(msToFe);
    proposal.currentMilestone = msToFe(proposal.currentMilestone);
  }
  if (proposal.rfp) {
    proposal.rfp = formatRFPFromGet(proposal.rfp);
  }
  return proposal;
}

export function formatRFPFromGet(rfp: RFP): RFP {
  if (rfp.bounty) {
    rfp.bounty = toZat(rfp.bounty as any);
  }
  if (rfp.acceptedProposals) {
    rfp.acceptedProposals = rfp.acceptedProposals.map(formatProposalFromGet);
  }
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
  // proposal detail
  if (state.proposal.detail) {
    state.proposal.detail.target = new BN(
      (state.proposal.detail.target as any) as string,
      16,
    );
    state.proposal.detail.funded = new BN(
      (state.proposal.detail.funded as any) as string,
      16,
    );
    if (state.proposal.detail.rfp && state.proposal.detail.rfp.bounty) {
      state.proposal.detail.rfp.bounty = new BN(
        (state.proposal.detail.rfp.bounty as any) as string,
        16,
      );
    }
  }
  // proposals
  state.proposal.page.items = state.proposal.page.items.map(p => ({
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

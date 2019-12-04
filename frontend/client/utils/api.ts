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
import { toZat, toUsd } from './units';

export function formatUserForPost(user: User) {
  return {
    ...user,
    avatar: user.avatar ? user.avatar.imageUrl : null,
  };
}

export function formatUserFromGet(user: UserState) {
  const bnUserProp = (p: any) => {
    if (p.isVersionTwo) {
      p.funded = toUsd(p.funded);
      p.target = toUsd(p.target);
    } else {
      p.funded = toZat(p.funded);
      p.target = toZat(p.target);
    }

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

  if (proposal.isVersionTwo) {
    proposal.target = toUsd(p.target);
    proposal.funded = toUsd(p.funded);

    // not used in v2 proposals, but populated for completeness
    proposal.contributionBounty = toUsd(p.contributionBounty);
    proposal.percentFunded = 0;
  } else {
    proposal.target = toZat(p.target);
    proposal.funded = toZat(p.funded);
    proposal.contributionBounty = toZat(p.contributionBounty);
    proposal.percentFunded = proposal.target.isZero()
      ? 0
      : proposal.funded.div(proposal.target.divn(100)).toNumber();
  }

  if (proposal.milestones) {
    const msToFe = (m: any) => {
      let amount;

      if (proposal.isVersionTwo) {
        const target = parseFloat(proposal.target.toString());
        const payoutPercent = parseFloat(m.payoutPercent);
        amount = ((target * payoutPercent) / 100).toFixed(2);
      } else {
        amount = proposal.target.mul(new BN(m.payoutPercent)).divn(100);
      }

      return {
        ...m,
        amount,
      };
    };
    proposal.milestones = proposal.milestones.map(msToFe);
    proposal.currentMilestone = msToFe(proposal.currentMilestone);
  }
  if (proposal.rfp) {
    proposal.rfp = formatRFPFromGet(proposal.rfp);
  }
  return proposal;
}

export function formatRFPFromGet(rfp: RFP): RFP {
  rfp.urlId = generateSlugUrl(rfp.id, rfp.title);
  if (rfp.bounty) {
    rfp.bounty = rfp.isVersionTwo ? toUsd(rfp.bounty as any) : toZat(rfp.bounty as any);
  }
  if (rfp.acceptedProposals) {
    rfp.acceptedProposals = rfp.acceptedProposals.map(formatProposalFromGet);
  }
  return rfp;
}

// NOTE: i18n on case-by-case basis
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
    const { isVersionTwo } = state.proposal.detail
    const base = isVersionTwo ? 10 : 16;

    state.proposal.detail.target = new BN(
      (state.proposal.detail.target as any) as string,
      base,
    );
    state.proposal.detail.funded = new BN(
      (state.proposal.detail.funded as any) as string,
      base,
    );
    state.proposal.detail.contributionBounty = new BN((state.proposal.detail
      .contributionBounty as any) as string);
    state.proposal.detail.milestones = state.proposal.detail.milestones.map(m => ({
      ...m,
      amount: isVersionTwo
        ? m.amount
        : new BN((m.amount as any) as string, 16),
    }));
    if (state.proposal.detail.rfp && state.proposal.detail.rfp.bounty) {
      state.proposal.detail.rfp.bounty = new BN(
        (state.proposal.detail.rfp.bounty as any) as string,
        base,
      );
    }
  }
  // proposals
  state.proposal.page.items = state.proposal.page.items.map(p => {
    const base = p.isVersionTwo ? 10 : 16;
    return {
      ...p,
      target: new BN((p.target as any) as string, base),
      funded: new BN((p.funded as any) as string, base),
      contributionBounty: new BN((p.contributionMatching as any) as string, base),
      milestones: p.milestones.map(m => ({
        ...m,
        amount: p.isVersionTwo
          ? m.amount
          : new BN((m.amount as any) as string, 16),
      })),
    };
  });
  // users
  const bnUserProp = (p: UserProposal) => {
    const base = p.isVersionTwo ? 10 : 16;
    p.funded = new BN(p.funded, base);
    p.target = new BN(p.target, base);
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
  // RFPs
  state.rfps.rfps = state.rfps.rfps.map(rfp => {
    const base = rfp.isVersionTwo ? 10 : 16;
    if (rfp.bounty) {
      rfp.bounty = new BN(rfp.bounty, base);
    }
    return rfp;
  });

  return state;
}

import BN from 'bn.js';
import { socialMediaToUrl } from 'utils/social';
import { User, CrowdFund, ProposalWithCrowdFund, UserProposal } from 'types';
import { UserState } from 'modules/users/reducers';
import { AppState } from 'store/reducers';

export function formatUserForPost(user: User) {
  return {
    ...user,
    avatar: user.avatar ? user.avatar.imageUrl : null,
    socialMedias: user.socialMedias.map(sm => socialMediaToUrl(sm.service, sm.username)),
  };
}

export function formatUserFromGet(user: UserState) {
  const bnUserProp = (p: UserProposal) => {
    p.funded = new BN(p.funded);
    p.target = new BN(p.target);
    return p;
  };
  user.createdProposals = user.createdProposals.map(bnUserProp);
  user.fundedProposals = user.fundedProposals.map(bnUserProp);
  return user;
}

export function formatCrowdFundFromGet(crowdFund: CrowdFund, base = 10): CrowdFund {
  const bnKeys = ['amountVotingForRefund', 'balance', 'funded', 'target'] as Array<
    keyof CrowdFund
  >;
  bnKeys.forEach(k => {
    crowdFund[k] = new BN(crowdFund[k] as string, base);
  });
  crowdFund.milestones = crowdFund.milestones.map(ms => {
    ms.amount = new BN(ms.amount, base);
    ms.amountAgainstPayout = new BN(ms.amountAgainstPayout, base);
    return ms;
  });
  crowdFund.contributors = crowdFund.contributors.map(c => {
    c.contributionAmount = new BN(c.contributionAmount, base);
    return c;
  });
  return crowdFund;
}

export function formatProposalFromGet(proposal: ProposalWithCrowdFund) {
  proposal.proposalUrlId = generateProposalUrl(proposal.proposalId, proposal.title);
  proposal.crowdFund = formatCrowdFundFromGet(proposal.crowdFund);
  for (let i = 0; i < proposal.crowdFund.milestones.length; i++) {
    proposal.milestones[i] = {
      ...proposal.milestones[i],
      ...proposal.crowdFund.milestones[i],
    };
  }
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
  // proposals
  state.proposal.proposals.forEach(p => {
    formatCrowdFundFromGet(p.crowdFund, 16);
    for (let i = 0; i < p.crowdFund.milestones.length; i++) {
      p.milestones[i] = {
        ...p.milestones[i],
        ...p.crowdFund.milestones[i],
      };
    }
  });
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

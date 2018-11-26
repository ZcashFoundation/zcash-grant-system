import BN from 'bn.js';
import { TeamMember, CrowdFund, ProposalWithCrowdFund, UserProposal } from 'types';
import { socialAccountsToUrls, socialUrlsToAccounts } from 'utils/social';
import { AppState } from 'store/reducers';

export function formatTeamMemberForPost(user: TeamMember) {
  return {
    displayName: user.name,
    title: user.title,
    accountAddress: user.ethAddress,
    emailAddress: user.emailAddress,
    avatar: user.avatarUrl ? { link: user.avatarUrl } : {},
    socialMedias: socialAccountsToUrls(user.socialAccounts).map(url => ({
      link: url,
    })),
  };
}

export function formatTeamMemberFromGet(user: any): TeamMember {
  return {
    name: user.displayName,
    title: user.title,
    ethAddress: user.accountAddress,
    emailAddress: user.emailAddress,
    avatarUrl: user.avatar && user.avatar.imageUrl,
    socialAccounts: socialUrlsToAccounts(
      user.socialMedias.map((sm: any) => sm.socialMediaLink),
    ),
  };
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
  proposal.team = proposal.team.map(formatTeamMemberFromGet);
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

import BN from 'bn.js';
import { TeamMember, CrowdFund, ProposalWithCrowdFund } from 'types';
import { socialAccountsToUrls, socialUrlsToAccounts } from 'utils/social';

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

export function formatCrowdFundFromGet(crowdFund: CrowdFund): CrowdFund {
  const bnKeys = ['amountVotingForRefund', 'balance', 'funded', 'target'] as Array<
    keyof CrowdFund
  >;
  bnKeys.forEach(k => {
    crowdFund[k] = new BN(crowdFund[k] as string);
  });
  crowdFund.milestones = crowdFund.milestones.map(ms => {
    ms.amount = new BN(ms.amount);
    ms.amountAgainstPayout = new BN(ms.amountAgainstPayout);
    return ms;
  });
  crowdFund.contributors = crowdFund.contributors.map(c => {
    c.contributionAmount = new BN(c.contributionAmount);
    return c;
  });
  return crowdFund;
}

export function formatProposalFromGet(proposal: ProposalWithCrowdFund) {
  for (let i = 0; i < proposal.crowdFund.milestones.length; i++) {
    proposal.milestones[i] = {
      ...proposal.milestones[i],
      ...proposal.crowdFund.milestones[i],
    };
  }
  proposal.team = proposal.team.map(formatTeamMemberFromGet);
  proposal.proposalUrlId = generateProposalUrl(proposal.proposalId, proposal.title);
  proposal.crowdFund = formatCrowdFundFromGet(proposal.crowdFund);
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

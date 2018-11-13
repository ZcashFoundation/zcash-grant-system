import { TeamMember } from 'types';
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

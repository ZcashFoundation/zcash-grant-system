import { TeamMember } from 'modules/create/types';
import { socialAccountsToUrls, socialUrlsToAccounts } from 'utils/social';

export function formatTeamMemberForPost(user: TeamMember) {
  return {
    displayName: user.name,
    title: user.title,
    accountAddress: user.ethAddress,
    emailAddress: user.emailAddress,
    avatar: { link: user.avatarUrl },
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
    avatarUrl: user.avatar.imageUrl,
    socialAccounts: socialUrlsToAccounts(
      user.socialMedias.map((sm: any) => sm.socialMediaLink),
    ),
  };
}

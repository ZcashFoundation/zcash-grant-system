import { User } from 'types';
import { socialMediaToUrl } from 'utils/social';

export function formatUserForPost(user: User) {
  return {
    ...user,
    avatar: user.avatar ? user.avatar.imageUrl : null,
    socialMedias: user.socialMedias.map(sm => socialMediaToUrl(sm.service, sm.username)),
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

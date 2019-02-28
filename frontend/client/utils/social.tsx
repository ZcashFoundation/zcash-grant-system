import React from 'react';
import { Icon } from 'antd';
import { SOCIAL_SERVICE, SocialInfo } from 'types';

const accountNameRegex = '([a-zA-Z0-9-_]*)';
export const SOCIAL_INFO: { [key in SOCIAL_SERVICE]: SocialInfo } = {
  [SOCIAL_SERVICE.GITHUB]: {
    service: SOCIAL_SERVICE.GITHUB,
    name: 'Github',
    format: `https://github.com/${accountNameRegex}`,
    icon: <Icon type="github" />,
  },
  [SOCIAL_SERVICE.TWITTER]: {
    service: SOCIAL_SERVICE.TWITTER,
    name: 'Twitter',
    format: `https://twitter.com/${accountNameRegex}`,
    icon: <Icon type="twitter" />,
  },
};

export function socialMediaToUrl(service: SOCIAL_SERVICE, username: string): string {
  return SOCIAL_INFO[service].format.replace(accountNameRegex, username);
}

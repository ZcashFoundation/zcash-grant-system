import React from 'react';
import { Icon } from 'antd';
import keybaseIcon from 'static/images/keybase.svg';

export enum SOCIAL_TYPE {
  GITHUB = 'GITHUB',
  TWITTER = 'TWITTER',
  LINKEDIN = 'LINKEDIN',
  KEYBASE = 'KEYBASE',
}

export interface SocialInfo {
  type: SOCIAL_TYPE;
  name: string;
  format: string;
  icon: React.ReactNode;
}

const accountNameRegex = '([a-zA-Z0-9-_]*)';
export const SOCIAL_INFO: { [key in SOCIAL_TYPE]: SocialInfo } = {
  [SOCIAL_TYPE.GITHUB]: {
    type: SOCIAL_TYPE.GITHUB,
    name: 'Github',
    format: `https://github.com/${accountNameRegex}`,
    icon: <Icon type="github" />,
  },
  [SOCIAL_TYPE.TWITTER]: {
    type: SOCIAL_TYPE.TWITTER,
    name: 'Twitter',
    format: `https://twitter.com/${accountNameRegex}`,
    icon: <Icon type="twitter" />,
  },
  [SOCIAL_TYPE.LINKEDIN]: {
    type: SOCIAL_TYPE.LINKEDIN,
    name: 'LinkedIn',
    format: `https://linkedin.com/in/${accountNameRegex}`,
    icon: <Icon type="linkedin" />,
  },
  [SOCIAL_TYPE.KEYBASE]: {
    type: SOCIAL_TYPE.KEYBASE,
    name: 'KeyBase',
    format: `https://keybase.io/${accountNameRegex}`,
    icon: <Icon component={keybaseIcon} />,
  },
};

export type SocialAccountMap = Partial<{ [key in SOCIAL_TYPE]: string }>;

function urlToAccount(format: string, url: string): string | false {
  const matches = url.match(new RegExp(format));
  return matches && matches[1] ? matches[1] : false;
}

export function socialAccountToUrl(account: string, type: SOCIAL_TYPE): string {
  return SOCIAL_INFO[type].format.replace(accountNameRegex, account);
}

export function socialUrlsToAccounts(urls: string[]): SocialAccountMap {
  const accounts: SocialAccountMap = {};
  urls.forEach(url => {
    Object.values(SOCIAL_INFO).forEach(s => {
      const account = urlToAccount(s.format, url);
      if (account) {
        accounts[s.type] = account;
      }
    });
  });
  return accounts;
}

export function socialAccountsToUrls(accounts: SocialAccountMap): string[] {
  return Object.keys(accounts).map((key: SOCIAL_TYPE) => {
    return socialAccountToUrl(accounts[key], key);
  });
}

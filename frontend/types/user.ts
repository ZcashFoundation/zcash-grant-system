import { SocialAccountMap } from 'types';

export interface User {
  accountAddress: string;
  userid: number | string;
  username: string;
  title: string;
  avatar: {
    '120x120': string;
  };
}

// TODO: Merge this or extend the `User` type in proposals/reducers.ts
export interface TeamMember {
  name: string;
  title: string;
  avatarUrl: string;
  ethAddress: string;
  emailAddress: string;
  socialAccounts: SocialAccountMap;
}

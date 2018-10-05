import React from 'react';

export type SocialAccountMap = Partial<{ [key in SOCIAL_TYPE]: string }>;

export interface SocialInfo {
  type: SOCIAL_TYPE;
  name: string;
  format: string;
  icon: React.ReactNode;
}

export enum SOCIAL_TYPE {
  GITHUB = 'GITHUB',
  TWITTER = 'TWITTER',
  LINKEDIN = 'LINKEDIN',
  KEYBASE = 'KEYBASE',
}

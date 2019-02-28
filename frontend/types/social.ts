import React from 'react';

export type SocialAccountMap = Partial<{ [key in SOCIAL_SERVICE]: string }>;

export interface SocialMedia {
  url: string;
  service: SOCIAL_SERVICE;
  username: string;
}

export interface SocialInfo {
  service: SOCIAL_SERVICE;
  name: string;
  format: string;
  icon: React.ReactNode;
}

export enum SOCIAL_SERVICE {
  GITHUB = 'GITHUB',
  TWITTER = 'TWITTER',
}

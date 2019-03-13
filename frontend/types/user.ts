import { SocialMedia } from 'types';

export interface User {
  userid: number;
  emailAddress?: string;
  emailVerified?: boolean;
  displayName: string;
  title: string;
  socialMedias: SocialMedia[];
  avatar: { imageUrl: string } | null;
}

import { SocialMedia } from 'types';

export interface User {
  userid: number;
  emailAddress?: string; // TODO: Split into full user type
  emailVerified?: boolean;
  displayName: string;
  title: string;
  socialMedias: SocialMedia[];
  avatar: { imageUrl: string } | null;
}

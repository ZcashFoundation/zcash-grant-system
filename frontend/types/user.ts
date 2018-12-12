import { SocialMedia } from 'types';

export interface User {
  userid: number;
  emailAddress?: string; // TODO: Split into full user type
  displayName: string;
  title: string;
  socialMedias: SocialMedia[];
  avatar: { imageUrl: string } | null;
}

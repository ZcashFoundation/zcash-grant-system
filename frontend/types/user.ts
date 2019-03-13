import { SocialMedia } from './social';
import { EmailSubscriptions } from './email';

export interface User {
  userid: number;
  emailAddress?: string;
  emailVerified?: boolean;
  displayName: string;
  title: string;
  socialMedias: SocialMedia[];
  avatar: { imageUrl: string } | null;
}

export interface UserSettings {
  emailSubscriptions: EmailSubscriptions;
  refundAddress?: string | null;
}

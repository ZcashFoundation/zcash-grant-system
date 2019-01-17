// NOTE: sync with /backend/grant/email/subscription_settings.py EmailSubscription enum keys
export interface EmailSubscriptions {
  fundedProposalCanceled: boolean;
  fundedProposalContribution: boolean;
  fundedProposalFunded: boolean;
  fundedProposalPayoutRequest: boolean;
  fundedProposalUpdate: boolean;
  myCommentReply: boolean;
  myProposalApproval: boolean;
  myProposalComment: boolean;
  myProposalContribution: boolean;
  myProposalFunded: boolean;
  myProposalRefund: boolean;
}

export enum EMAIL_SUBSCRIPTION_CATEGORY {
  GENERAL = 'GENERAL',
  PROPOSAL = 'PROPOSAL',
  FUNDED = 'FUNDED',
}

export interface EmailSubscriptionInfo {
  description: string;
  category: EMAIL_SUBSCRIPTION_CATEGORY;
  value: boolean;
}

export interface EmailSubscriptionCategoryInfo {
  description: string;
}

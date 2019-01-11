import {
  EmailSubscriptions,
  EmailSubscriptionInfo,
  EmailSubscriptionCategoryInfo,
  EMAIL_SUBSCRIPTION_CATEGORY,
} from 'types';

type ESKey = keyof EmailSubscriptions;
export const EMAIL_SUBSCRIPTIONS: { [key in ESKey]: EmailSubscriptionInfo } = {
  fundedProposalCanceled: {
    description: 'A proposal you have funded gets canceled',
    category: EMAIL_SUBSCRIPTION_CATEGORY.FUNDED,
    value: false,
  },
  fundedProposalContribution: {
    description: 'Your proposal contribution is confirmed',
    category: EMAIL_SUBSCRIPTION_CATEGORY.FUNDED,
    value: false,
  },
  fundedProposalFunded: {
    description: 'A proposal you have contributed to gets full funding',
    category: EMAIL_SUBSCRIPTION_CATEGORY.FUNDED,
    value: false,
  },
  fundedProposalPayoutRequest: {
    description: 'There is a payout request for a proposal you have funded',
    category: EMAIL_SUBSCRIPTION_CATEGORY.FUNDED,
    value: false,
  },
  fundedProposalUpdate: {
    description: 'An update is posted on a proposal you have contributed to',
    category: EMAIL_SUBSCRIPTION_CATEGORY.FUNDED,
    value: false,
  },
  myCommentReply: {
    description: 'A comment you have made gets a response',
    category: EMAIL_SUBSCRIPTION_CATEGORY.GENERAL,
    value: false,
  },
  myProposalApproval: {
    description: 'Your proposal is approved or rejected',
    category: EMAIL_SUBSCRIPTION_CATEGORY.PROPOSAL,
    value: false,
  },
  myProposalComment: {
    description: 'Your proposal is commented on',
    category: EMAIL_SUBSCRIPTION_CATEGORY.PROPOSAL,
    value: false,
  },
  myProposalContribution: {
    description: 'Your proposal gets a contribution',
    category: EMAIL_SUBSCRIPTION_CATEGORY.PROPOSAL,
    value: false,
  },
  myProposalFunded: {
    description: 'Your proposal gets fully funded',
    category: EMAIL_SUBSCRIPTION_CATEGORY.PROPOSAL,
    value: false,
  },
  myProposalRefund: {
    description: 'Your proposal gets refunded',
    category: EMAIL_SUBSCRIPTION_CATEGORY.PROPOSAL,
    value: false,
  },
};

export const EMAIL_SUBSCRIPTION_CATEGORIES: {
  [key in EMAIL_SUBSCRIPTION_CATEGORY]: EmailSubscriptionCategoryInfo
} = {
  [EMAIL_SUBSCRIPTION_CATEGORY.GENERAL]: { description: 'General' },
  [EMAIL_SUBSCRIPTION_CATEGORY.PROPOSAL]: { description: 'Your Proposals' },
  [EMAIL_SUBSCRIPTION_CATEGORY.FUNDED]: {
    description: 'Proposals you have contributed to',
  },
};

export const groupEmailSubscriptionsByCategory = (es: EmailSubscriptions) => {
  return Object.entries(EMAIL_SUBSCRIPTION_CATEGORIES).map(([k, v]) => {
    const subscriptionSettings = Object.entries(EMAIL_SUBSCRIPTIONS)
      .filter(([_, sv]) => sv.category === k)
      .map(([sk, sv]) => {
        sv.value = es[sk as ESKey];
        const svWk = sv as EmailSubscriptionInfo & { key: ESKey };
        svWk.key = sk as ESKey;
        return svWk;
      });

    const vWk = v as EmailSubscriptionCategoryInfo & { key: EMAIL_SUBSCRIPTION_CATEGORY };
    vWk.key = k as EMAIL_SUBSCRIPTION_CATEGORY;
    return {
      category: vWk,
      subscriptionSettings,
    };
  });
};

import { PROPOSAL_CATEGORY } from 'api/constants';
import { SOCIAL_TYPE } from 'utils/social';
import { CreateFormState } from 'modules/create/types';

const createExampleProposal = (
  payOutAddress: string,
  trustees: string[],
): CreateFormState => {
  return {
    title: 'Grant.io T-Shirts',
    brief: "The most stylish wear, sporting your favorite brand's logo",
    category: PROPOSAL_CATEGORY.COMMUNITY,
    team: [
      {
        name: 'John Smith',
        title: 'CEO of Grant.io',
        avatarUrl: `https://randomuser.me/api/portraits/men/${Math.floor(
          Math.random() * 80,
        )}.jpg`,
        ethAddress: payOutAddress,
        emailAddress: 'test@grant.io',
        socialAccounts: {
          [SOCIAL_TYPE.GITHUB]: 'dternyak',
          [SOCIAL_TYPE.LINKEDIN]: 'dternyak',
        },
      },
      {
        name: 'Jane Smith',
        title: 'T-Shirt Designer',
        avatarUrl: `https://randomuser.me/api/portraits/women/${Math.floor(
          Math.random() * 80,
        )}.jpg`,
        ethAddress: '0x4bbeEB066eD09B7AEd07bF39EEe0460DFa261520',
        emailAddress: 'designer@tshirt.com',
        socialAccounts: {
          [SOCIAL_TYPE.KEYBASE]: 'willo',
          [SOCIAL_TYPE.TWITTER]: 'wbobeirne',
        },
      },
    ],
    details:
      '![](https://i.imgur.com/aQagS0D.png)\n\nWe all know it, Grant.io is the bee\'s knees. But wouldn\'t it be great if you could show all your friends and family how much you love it? Well that\'s what we\'re here to offer today.\n\n# What We\'re Building\n\nWhy, T-Shirts of course! These beautiful shirts made out of 100% cotton and laser printed for long lasting goodness come from American Apparel. We\'ll be offering them in 4 styles:\n\n* Crew neck (wrinkled)\n* Crew neck (straight)\n* Scoop neck (fitted)\n* V neck (fitted)\n\nShirt sizings will be as follows:\n\n| Size   | S | M | L | XL |\n|--------|-----|-----|-----|------|\n| **Width**  | 18" | 20" | 22" | 24"  |\n| **Length** | 28" | 29" | 30" | 31"  |\n\n# Who We Are\n\nWe are the team behind grant.io. In addition to our software engineering experience, we have over 78 years of T-Shirt printing expertise combined. Sometimes I wake up at night and realize I was printing shirts in my dreams. Weird, man.\n\n# Expense Breakdown\n\n* $1,000 - A professional designer will hand-craft each letter on the shirt.\n* $500 - We\'ll get the shirt printed from 5 different factories and choose the best quality one.\n* $3,000 - The full run of prints, with 20 smalls, 20 mediums, and 20 larges.\n* $500 - Pizza. Lots of pizza.\n\n**Total**: $5,000',
    amountToRaise: '5',
    payOutAddress,
    trustees,
    milestones: [
      {
        title: 'Initial Funding',
        description:
          'This will be used to pay for a professional designer to hand-craft each letter on the shirt.',
        date: 'October 2018',
        payoutPercent: 30,
        immediatePayout: true,
      },
      {
        title: 'Test Prints',
        description:
          "We'll get test prints from 5 different factories and choose the highest quality shirts. Once we've decided, we'll order a full batch of prints.",
        date: 'November 2018',
        payoutPercent: 20,
        immediatePayout: false,
      },
      {
        title: 'All Shirts Printed',
        description:
          "All of the shirts have been printed, hooray! They'll be given out at conferences and meetups.",
        date: 'December 2018',
        payoutPercent: 50,
        immediatePayout: false,
      },
    ],
    deadline: 300,
    milestoneDeadline: 60,
  };
};

export default createExampleProposal;

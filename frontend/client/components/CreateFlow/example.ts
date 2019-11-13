import { PROPOSAL_CATEGORY } from 'api/constants';
import { ProposalDraft } from 'types';

const createExampleProposal = (): Partial<ProposalDraft> => {
  const cats = Object.keys(PROPOSAL_CATEGORY);
  const category = cats[Math.floor(Math.random() * cats.length)] as PROPOSAL_CATEGORY;
  return {
    title: 'Grant.io T-Shirts',
    brief: "The most stylish wear, sporting your favorite brand's logo",
    category,
    content:
      '![](https://i.imgur.com/aQagS0D.png)\n\nWe all know it, Grant.io is the bee\'s knees. But wouldn\'t it be great if you could show all your friends and family how much you love it? Well that\'s what we\'re here to offer today.\n\n# What We\'re Building\n\nWhy, T-Shirts of course! These beautiful shirts made out of 100% cotton and laser printed for long lasting goodness come from American Apparel. We\'ll be offering them in 4 styles:\n\n* Crew neck (wrinkled)\n* Crew neck (straight)\n* Scoop neck (fitted)\n* V neck (fitted)\n\nShirt sizings will be as follows:\n\n| Size   | S | M | L | XL |\n|--------|-----|-----|-----|------|\n| **Width**  | 18" | 20" | 22" | 24"  |\n| **Length** | 28" | 29" | 30" | 31"  |\n\n# Who We Are\n\nWe are the team behind grant.io. In addition to our software engineering experience, we have over 78 years of T-Shirt printing expertise combined. Sometimes I wake up at night and realize I was printing shirts in my dreams. Weird, man.\n\n# Expense Breakdown\n\n* $1,000 - A professional designer will hand-craft each letter on the shirt.\n* $500 - We\'ll get the shirt printed from 5 different factories and choose the best quality one.\n* $3,000 - The full run of prints, with 20 smalls, 20 mediums, and 20 larges.\n* $500 - Pizza. Lots of pizza.\n\n**Total**: $5,000',
    target: '5',
    // Testnet address, assumes you wouldn't use this in production
    payoutAddress:
      'ztestsapling12uyydevkh2gsnnrzuhzz4taw3v544jrpa3v6t7zv4ae45dquau7cfw26u3uzt520m08cs3jxqqs',
    milestones: [
      {
        title: 'Initial Funding',
        content:
          'This will be used to pay for a professional designer to hand-craft each letter on the shirt.',
        daysEstimated: '40',
        payoutPercent: '30',
        immediatePayout: true,
      },
      {
        title: 'Test Prints',
        content:
          "We'll get test prints from 5 different factories and choose the highest quality shirts. Once we've decided, we'll order a full batch of prints.",
        daysEstimated: '30',
        payoutPercent: '20',
        immediatePayout: false,
      },
      {
        title: 'All Shirts Printed',
        content:
          "All of the shirts have been printed, hooray! They'll be given out at conferences and meetups.",
        daysEstimated: '30',
        payoutPercent: '50',
        immediatePayout: false,
      },
    ],
  };
};

export default createExampleProposal;

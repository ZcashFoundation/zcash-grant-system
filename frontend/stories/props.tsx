import {
  Contributor,
  MILESTONE_STAGE,
  Proposal,
  ProposalMilestone,
  STATUS,
  PROPOSAL_ARBITER_STATUS,
} from 'types';
import { PROPOSAL_CATEGORY, PROPOSAL_STAGE } from 'api/constants';
import BN from 'bn.js';
import moment from 'moment';

const oneZec = new BN('100000000');

export function getGovernanceMilestonesProps({
  isContributor = true,
}: {
  isContributor?: boolean;
}) {
  return {
    accounts: [
      isContributor
        ? '0xAAA91bde2303f2f43325b2108d26f1eaba1e32b'
        : '0x0c7C6178AD0618Bf289eFd5E1Ff9Ada25fC3bDE7',
    ],
    isMilestoneActionPending: false,
    milestoneActionError: '',
  };
}

export function generateProposal({
  amount = 10,
  funded = 5,
  created = Date.now(),
  milestoneOverrides = [],
  contributorOverrides = [],
  milestoneCount = 3,
}: {
  amount?: number;
  funded?: number;
  created?: number;
  deadline?: number;
  milestoneOverrides?: Array<Partial<ProposalMilestone>>;
  contributorOverrides?: Array<Partial<Contributor>>;
  milestoneCount?: number;
}) {
  const amountBn = oneZec.mul(new BN(amount));
  const fundedBn = oneZec.mul(new BN(funded));
  const percentFunded = amount / funded;

  let contributors = [
    {
      address: '0xAAA91bde2303f2f43325b2108d26f1eaba1e32b',
      contributionAmount: new BN(0),
      refundVote: false,
      refunded: false,
      proportionalContribution: '',
      milestoneNoVotes: [false],
    },
    {
      address: '0xBBB491bde2303f2f43325b2108d26f1eaba1e32b',
      contributionAmount: new BN(0),
      refundVote: false,
      refunded: false,
      proportionalContribution: '',
      milestoneNoVotes: [false],
    },
    {
      address: '0xCCC491bde2303f2f43325b2108d26f1eaba1e32b',
      contributionAmount: new BN(0),
      refundVote: false,
      refunded: false,
      proportionalContribution: '',
      milestoneNoVotes: [false],
    },
    {
      address: '0xDDD491bde2303f2f43325b2108d26f1eaba1e32b',
      contributionAmount: new BN(0),
      refundVote: false,
      refunded: false,
      proportionalContribution: '',
      milestoneNoVotes: [false],
    },
  ];

  const eachContributorAmount = fundedBn.div(new BN(contributors.length));
  contributors.forEach(c => (c.contributionAmount = eachContributorAmount));
  contributorOverrides.forEach((co, idx) => {
    Object.assign(contributors[idx], co);
  });

  if (funded === 0) {
    contributors = [];
  }

  const genMilestoneTitle = () => {
    const ts = ['40chr ', 'Really ', 'Really ', 'Long ', 'Milestone Title'];
    const rand = Math.floor(Math.random() * Math.floor(ts.length));
    return ts.slice(rand).join('');
  };

  const genMilestone = (
    overrides: Partial<ProposalMilestone> = {},
  ): ProposalMilestone => {
    if (overrides.index) {
      overrides.dateEstimated = moment()
        .add(overrides.index, 'month')
        .unix();
    }

    const defaults: ProposalMilestone = {
      id: 0,
      title: 'Milestone A',
      content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod 
           tempor incididunt ut labore et dolore magna aliqua.`,
      dateEstimated: moment().unix(),
      immediatePayout: true,
      index: 0,
      stage: MILESTONE_STAGE.IDLE,
      amount: amountBn,
      payoutPercent: '33',
    };
    return { ...defaults, ...overrides };
  };

  const milestones = [...Array(milestoneCount).keys()].map(i => {
    const overrides = {
      id: i,
      index: i,
      title: genMilestoneTitle(),
      immediatePayout: i === 0,
      payoutRequestVoteDeadline: i !== 0 ? Date.now() + 3600000 : 0,
      payoutPercent: '' + (1 / milestoneCount) * 100,
    };
    return genMilestone(overrides);
  });

  const eachMilestoneAmount = amountBn.div(new BN(milestones.length));
  milestones.forEach(ms => (ms.amount = eachMilestoneAmount));
  milestoneOverrides.forEach((mso, idx) => {
    Object.assign(milestones[idx], mso);
  });

  const proposal: Proposal = {
    proposalId: 12345,
    status: STATUS.DRAFT,
    proposalUrlId: '12345-crowdfund-title',
    proposalAddress: '0x033fDc6C01DC2385118C7bAAB88093e22B8F0710',
    payoutAddress: 'z123',
    dateCreated: created / 1000,
    datePublished: created / 1000,
    dateApproved: created / 1000,
    deadlineDuration: 86400 * 60,
    target: amountBn,
    funded: fundedBn,
    percentFunded,
    contributionMatching: 0,
    contributionBounty: new BN(0),
    title: 'Crowdfund Title',
    brief: 'A cool test crowdfund',
    content: 'body',
    stage: PROPOSAL_STAGE.WIP,
    category: PROPOSAL_CATEGORY.COMMUNITY,
    isStaked: true,
    arbiter: {
      status: PROPOSAL_ARBITER_STATUS.ACCEPTED,
      user: {
        userid: 999,
        displayName: 'Test Arbiter',
        title: '',
        emailAddress: 'test@arbiter.com',
        avatar: null,
        socialMedias: [],
      },
    },
    acceptedWithFunding: null,
    isVersionTwo: false,
    team: [
      {
        userid: 123,
        displayName: 'Test Proposer',
        title: '',
        emailAddress: '',
        avatar: null,
        socialMedias: [],
      },
      {
        userid: 456,
        displayName: 'Test Proposer',
        title: '',
        emailAddress: '',
        avatar: null,
        socialMedias: [],
      },
      {
        userid: 789,
        displayName: 'Test Proposer',
        title: '',
        emailAddress: '',
        avatar: null,
        socialMedias: [],
      },
    ],
    milestones,
  };

  const props = {
    sendLoading: false,
    proposal,
    ...proposal, // yeah...
  };

  return props;
}

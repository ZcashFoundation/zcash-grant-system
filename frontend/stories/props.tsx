import {
  Contributor,
  Milestone,
  MILESTONE_STATE,
  ProposalWithCrowdFund,
} from 'modules/proposals/reducers';
import { PROPOSAL_CATEGORY } from 'api/constants';
import {
  fundCrowdFund,
  requestMilestonePayout,
  payMilestonePayout,
  voteMilestonePayout,
} from 'modules/web3/actions';
import Web3 from 'web3';
import BN from 'bn.js';

const oneEth = new BN('1000000000000000000');

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
    requestMilestonePayout,
    payMilestonePayout,
    voteMilestonePayout,
  };
}

export function getProposalWithCrowdFund({
  amount = 10,
  funded = 5,
  created = Date.now(),
  deadline = Date.now() + 1000 * 60 * 60 * 10,
  milestoneOverrides = [],
  contributorOverrides = [],
}: {
  amount?: number;
  funded?: number;
  created?: number;
  deadline?: number;
  milestoneOverrides?: Array<Partial<Milestone>>;
  contributorOverrides?: Array<Partial<Contributor>>;
}) {
  const amountBn = oneEth.mul(new BN(amount));
  const fundedBn = oneEth.mul(new BN(funded));

  const contributors = [
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

  const milestones = [
    {
      title: 'Milestone A',
      body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod 
             tempor incididunt ut labore et dolore magna aliqua.`,
      content: '',
      dateCreated: '2018-09-23T19:06:15.844399+00:00',
      dateEstimated: '2018-10-01T00:00:00+00:00',
      immediatePayout: true,
      index: 0,
      state: MILESTONE_STATE.WAITING,
      amount: amountBn,
      amountAgainstPayout: new BN(0),
      percentAgainstPayout: 0,
      payoutRequestVoteDeadline: 0,
      isPaid: false,
      isImmediatePayout: true,
      payoutPercent: '33',
      stage: 'NOT_REQUESTED',
    },
    {
      title: 'Milestone B',
      body: `Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
             nisi ut aliquip ex ea commodo consequat.`,
      content: '',
      dateCreated: '2018-09-23T19:06:15.844399+00:00',
      dateEstimated: '2018-11-01T00:00:00+00:00',
      immediatePayout: false,
      index: 1,
      state: MILESTONE_STATE.WAITING,
      amount: amountBn,
      amountAgainstPayout: new BN(0),
      percentAgainstPayout: 0,
      payoutRequestVoteDeadline: Date.now(),
      isPaid: false,
      isImmediatePayout: false,
      payoutPercent: '33',
      stage: 'NOT_REQUESTED',
    },
    {
      title: 'Milestone C',
      body: `Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
             nisi ut aliquip ex ea commodo consequat.`,
      content: '',
      dateCreated: '2018-09-23T19:06:15.844399+00:00',
      dateEstimated: '2018-12-01T00:00:00+00:00',
      immediatePayout: false,
      index: 2,
      state: MILESTONE_STATE.WAITING,
      amount: amountBn,
      amountAgainstPayout: new BN(0),
      percentAgainstPayout: 0,
      payoutRequestVoteDeadline: Date.now(),
      isPaid: false,
      isImmediatePayout: false,
      payoutPercent: '33',
      stage: 'NOT_REQUESTED',
    },
  ];

  const eachMilestoneAmount = fundedBn.div(new BN(milestones.length));
  milestones.forEach(ms => (ms.amount = eachMilestoneAmount));
  milestoneOverrides.forEach((mso, idx) => {
    Object.assign(milestones[idx], mso);
  });

  const proposal: ProposalWithCrowdFund = {
    proposalId: '0x033fDc6C01DC2385118C7bAAB88093e22B8F0710',
    dateCreated: created / 1000,
    title: 'Crowdfund Title',
    body: 'body',
    stage: 'FUNDING_REQUIRED',
    category: PROPOSAL_CATEGORY.COMMUNITY,
    team: [
      {
        name: 'Test Proposer',
        title: '',
        ethAddress: '0x0c7C6178AD0618Bf289eFd5E1Ff9Ada25fC3bDE7',
        emailAddress: '',
        avatarUrl: '',
        socialAccounts: {},
      },
      {
        name: 'Test Proposer',
        title: '',
        ethAddress: '0x4bbeEB066eD09B7AEd07bF39EEe0460DFa261520',
        emailAddress: '',
        avatarUrl: '',
        socialAccounts: {},
      },
      {
        name: 'Test Proposer',
        title: '',
        ethAddress: '0x529104532a9779ea9eae0c1e325b3368e0f8add4',
        emailAddress: '',
        avatarUrl: '',
        socialAccounts: {},
      },
    ],
    milestones,
    crowdFund: {
      beneficiary: '0x0c7C6178AD0618Bf289eFd5E1Ff9Ada25fC3bDE7',
      trustees: [
        '0x0c7C6178AD0618Bf289eFd5E1Ff9Ada25fC3bDE7',
        '0x4bbeEB066eD09B7AEd07bF39EEe0460DFa261520',
        '0x529104532a9779ea9eae0c1e325b3368e0f8add4',
      ],
      contributors,
      milestones,
      deadline,
      milestoneVotingPeriod: 3600000,
      isFrozen: false,
      isRaiseGoalReached: amount <= funded,
      immediateFirstMilestonePayout: true,
      balance: new BN(0),
      funded: fundedBn,
      percentFunded: (funded / amount) * 100,
      target: amountBn,
      amountVotingForRefund: new BN(0),
      percentVotingForRefund: 0,
    },
    crowdFundContract: {},
  };

  const props = {
    sendLoading: false,
    fundCrowdFund,
    web3: new Web3(),
    proposal,
    ...proposal, // yeah...
  };

  return props;
}

// backend
export interface SocialMedia {
  socialMediaLink: string;
}
export interface Milestone {
  body: string;
  content: string;
  dateCreated: string;
  dateEstimated: string;
  immediatePayout: boolean;
  payoutPercent: string;
  stage: string;
  title: string;
}
export interface Proposal {
  proposalId: string;
  dateCreated: number;
  title: string;
  body: string;
  stage: string;
  category: string;
  milestones: Milestone[];
  team: User[];
  comments: Comment[];
  contractStatus: string;
  contract: Contract;
}
export interface Comment {
  commentId: string;
  dateCreated: string;
  content: string;
}
export interface User {
  accountAddress: string;
  avatar: null | { imageUrl: string };
  displayName: string;
  emailAddress: string;
  socialMedias: SocialMedia[];
  title: string;
  userid: number;
  proposals: Proposal[];
  comments: Comment[];
}

// web3 contract
export const INITIAL_CONTRACT_CONTRIBUTOR = {
  address: '',
  milestoneNoVotes: [] as string[],
  contributionAmount: '',
  refundVote: false,
  refunded: false,
};
export type ContractContributor = typeof INITIAL_CONTRACT_CONTRIBUTOR;
export const INITIAL_CONTRACT_MILESTONE = {
  amount: '',
  payoutRequestVoteDeadline: '',
  amountVotingAgainstPayout: '',
  paid: '',
};
export type ContractMilestone = typeof INITIAL_CONTRACT_MILESTONE;
export interface ContractMethodInput {
  type: string;
  name: string;
}
export const INITIAL_CONTRACT_METHOD = {
  updated: '',
  status: 'unloaded',
  value: '' as string | string[] | ContractMilestone[] | ContractContributor[],
  type: '',
  input: [] as ContractMethodInput[],
  error: '',
  format: '',
};
export type ContractMethod = typeof INITIAL_CONTRACT_METHOD;
export const INITIAL_CONTRACT = {
  isCallerTrustee: { ...INITIAL_CONTRACT_METHOD },
  immediateFirstMilestonePayout: { ...INITIAL_CONTRACT_METHOD },
  beneficiary: { ...INITIAL_CONTRACT_METHOD },
  amountRaised: { ...INITIAL_CONTRACT_METHOD },
  raiseGoal: { ...INITIAL_CONTRACT_METHOD },
  isRaiseGoalReached: { ...INITIAL_CONTRACT_METHOD },
  amountVotingForRefund: { ...INITIAL_CONTRACT_METHOD },
  milestoneVotingPeriod: { ...INITIAL_CONTRACT_METHOD, format: 'duration' },
  deadline: { ...INITIAL_CONTRACT_METHOD, format: 'time' },
  isFailed: { ...INITIAL_CONTRACT_METHOD },
  getBalance: { ...INITIAL_CONTRACT_METHOD, type: 'eth' },
  frozen: { ...INITIAL_CONTRACT_METHOD },
  getFreezeReason: { ...INITIAL_CONTRACT_METHOD },
  trustees: { ...INITIAL_CONTRACT_METHOD, type: 'array' },
  contributorList: { ...INITIAL_CONTRACT_METHOD, type: 'array' },
  contributors: { ...INITIAL_CONTRACT_METHOD, type: 'deep' },
  milestones: { ...INITIAL_CONTRACT_METHOD, type: 'array' },
  contribute: {
    ...INITIAL_CONTRACT_METHOD,
    type: 'send',
    input: [{ name: 'value', type: 'wei' }],
  },
  refund: {
    ...INITIAL_CONTRACT_METHOD,
    type: 'send',
    input: [],
  },
  withdraw: {
    ...INITIAL_CONTRACT_METHOD,
    type: 'send',
    input: [{ name: 'address', type: 'string' }],
  },
  requestMilestonePayout: {
    ...INITIAL_CONTRACT_METHOD,
    type: 'send',
    input: [{ name: 'index', type: 'integer' }],
  },
  voteMilestonePayout: {
    ...INITIAL_CONTRACT_METHOD,
    type: 'send',
    input: [{ name: 'index', type: 'integer' }, { name: 'vote', type: 'boolean' }],
  },
  payMilestonePayout: {
    ...INITIAL_CONTRACT_METHOD,
    type: 'send',
    input: [{ name: 'index', type: 'integer' }],
  },
  voteRefund: {
    ...INITIAL_CONTRACT_METHOD,
    type: 'send',
    input: [{ name: 'vote', type: 'boolean' }],
  },
};
export type Contract = typeof INITIAL_CONTRACT;

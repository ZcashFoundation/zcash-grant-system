import Web3 from 'web3';
import types from './types';

interface Contract {
  _address: string;
}

export interface Web3State {
  web3: Web3 | null;
  isMissingWeb3: boolean;
  isWrongNetwork: boolean;
  isWeb3Locked: boolean;

  contracts: Contract[];
  contractsLoading: boolean;
  contractsError: null | string;

  accounts: any[];
  accountsLoading: boolean;
  accountsError: null | string;

  sendLoading: boolean;
  sendError: null | string;

  crowdFundLoading: boolean;
  crowdFundError: string | null;
  crowdFundCreatedAddress: string | null;

  isMilestoneActionPending: boolean;
  milestoneActionError: null | string;

  isRefundActionPending: boolean;
  refundActionError: null | string;
}

export const INITIAL_STATE: Web3State = {
  web3: null,
  isMissingWeb3: false,
  isWrongNetwork: false,
  isWeb3Locked: false,

  contracts: [],
  contractsLoading: false,
  contractsError: null,

  accounts: [],
  accountsLoading: false,
  accountsError: null,

  sendLoading: false,
  sendError: null,

  crowdFundLoading: false,
  crowdFundError: null,
  crowdFundCreatedAddress: null,

  isMilestoneActionPending: false,
  milestoneActionError: null,

  isRefundActionPending: false,
  refundActionError: null,
};

function addContract(state: Web3State, payload: Contract) {
  let contracts = state.contracts;

  const existingContract = state.contracts.find(
    (c: Contract) => c._address === payload._address,
  );

  if (!existingContract) {
    contracts = contracts.concat(payload);
  }

  return {
    ...state,
    contracts,
    contractsLoading: false,
  };
}

export default (state = INITIAL_STATE, action: any): Web3State => {
  const { payload } = action;

  switch (action.type) {
    case types.WEB3_FULFILLED:
      return {
        ...state,
        web3: payload,
        isMissingWeb3: false,
      };
    case types.WEB3_REJECTED:
      return {
        ...state,
        web3: null,
        isMissingWeb3: true,
      };

    case types.CROWD_FUND_PENDING:
      return {
        ...state,
        crowdFundLoading: true,
        crowdFundError: null,
      };
    case types.CROWD_FUND_CREATED:
      return {
        ...state,
        crowdFundLoading: false,
        crowdFundCreatedAddress: payload,
      };
    case types.CROWD_FUND_REJECTED:
      return {
        ...state,
        crowdFundLoading: false,
        crowdFundError: payload,
      };
    case types.RESET_CROWD_FUND:
      return {
        ...state,
        crowdFundLoading: false,
        crowdFundError: null,
        crowdFundCreatedAddress: null,
      };

    case types.CONTRACT_PENDING:
      return {
        ...state,
        contractsLoading: true,
      };
    case types.CONTRACT_FULFILLED:
      return addContract(state, payload);
    case types.CONTRACT_REJECTED:
      return {
        ...state,
        contractsLoading: false,
        contractsError: payload,
      };

    case types.ACCOUNTS_PENDING:
      return {
        ...state,
        accounts: [],
        accountsLoading: true,
        accountsError: null,
      };
    case types.ACCOUNTS_FULFILLED:
      return {
        ...state,
        accounts: payload,
        accountsLoading: false,
        isWeb3Locked: false,
      };
    case types.ACCOUNTS_REJECTED:
      return {
        ...state,
        accountsLoading: false,
        accountsError: payload,
      };

    case types.SEND_PENDING:
      return {
        ...state,
        sendError: null,
        sendLoading: true,
      };
    case types.SEND_FULFILLED:
      return {
        ...state,
        sendLoading: false,
      };
    case types.SEND_REJECTED:
      return {
        ...state,
        sendLoading: false,
        sendError: action.payload,
      };

    case types.SET_WRONG_NETWORK:
      return {
        ...state,
        isWrongNetwork: true,
      };
    case types.SET_WEB3_LOCKED:
      return {
        ...state,
        isWeb3Locked: true,
      };

    case types.PAY_MILESTONE_PAYOUT_PENDING:
    case types.REQUEST_MILESTONE_PAYOUT_PENDING:
    case types.VOTE_AGAINST_MILESTONE_PAYOUT_PENDING:
      return {
        ...state,
        milestoneActionError: null,
        isMilestoneActionPending: true,
      };

    case types.PAY_MILESTONE_PAYOUT_FULFILLED:
    case types.REQUEST_MILESTONE_PAYOUT_FULFILLED:
    case types.VOTE_AGAINST_MILESTONE_PAYOUT_FULFILLED:
      return {
        ...state,
        isMilestoneActionPending: false,
      };

    case types.PAY_MILESTONE_PAYOUT_REJECTED:
    case types.REQUEST_MILESTONE_PAYOUT_REJECTED:
    case types.VOTE_AGAINST_MILESTONE_PAYOUT_REJECTED:
      return {
        ...state,
        milestoneActionError: payload,
        isMilestoneActionPending: false,
      };

    case types.VOTE_REFUND_PENDING:
    case types.WITHDRAW_REFUND_PENDING:
    case types.TRIGGER_REFUND_PENDING:
      return {
        ...state,
        isRefundActionPending: true,
        refundActionError: null,
      };
    case types.VOTE_REFUND_FULFILLED:
    case types.WITHDRAW_REFUND_FULFILLED:
    case types.TRIGGER_REFUND_FULFILLED:
      return {
        ...state,
        isRefundActionPending: false,
      };
    case types.VOTE_REFUND_REJECTED:
    case types.WITHDRAW_REFUND_REJECTED:
    case types.TRIGGER_REFUND_REJECTED:
      return {
        ...state,
        refundActionError: payload,
        isRefundActionPending: false,
      };

    default:
      return state;
  }
};

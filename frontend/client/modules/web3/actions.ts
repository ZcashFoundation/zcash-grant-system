import types from './types';
import { Dispatch } from 'redux';
import getWeb3 from 'lib/getWeb3';
import { postProposal } from 'api/api';
import getContract, { WrongNetworkError } from 'lib/getContract';
import { sleep } from 'utils/helpers';
import { fetchProposal, fetchProposals } from 'modules/proposals/actions';
import { PROPOSAL_CATEGORY } from 'api/constants';
import { AppState } from 'store/reducers';

type GetState = () => AppState;

function handleWrongNetworkError(dispatch: (action: any) => void) {
  return (err: Error) => {
    if (err.constructor === WrongNetworkError) {
      dispatch({ type: types.SET_WRONG_NETWORK });
    } else {
      throw err;
    }
  };
}

export type TSetWeb3 = typeof setWeb3;
export function setWeb3() {
  return (dispatch: Dispatch<any>) => {
    dispatch({
      type: types.WEB3,
      payload: getWeb3(),
    });
  };
}

export type TSetContract = typeof setContract;
export function setContract(json: any, deployedAddress?: string) {
  return (dispatch: Dispatch<any>, getState: GetState) => {
    const state = getState();
    if (state.web3.web3) {
      // TODO: Type me as promise dispatch
      (dispatch as any)({
        type: types.CONTRACT,
        payload: getContract(state.web3.web3, json, deployedAddress),
      }).catch(handleWrongNetworkError(dispatch));
    } else {
      dispatch({
        type: types.CONTRACT_REJECTED,
        payload: {
          error: 'No web3 object available',
        },
      });
    }
  };
}

export type TSetAccounts = typeof setAccounts;
export function setAccounts() {
  return (dispatch: Dispatch<any>, getState: GetState) => {
    const state = getState();
    if (state.web3.web3) {
      dispatch({ type: types.ACCOUNTS_PENDING });

      state.web3.web3.eth
        .getAccounts()
        .then((accounts: any[]) => {
          if (accounts && accounts.length) {
            dispatch({
              type: types.ACCOUNTS_FULFILLED,
              payload: accounts,
            });
          } else {
            dispatch({ type: types.SET_WEB3_LOCKED });
            throw new Error('No accounts found. Make sure metamask is unlocked.');
          }
        })
        .catch((err: Error) => {
          dispatch({
            type: types.ACCOUNTS_REJECTED,
            payload: err.message || err.toString(),
          });
        });
    } else {
      dispatch({
        type: types.ACCOUNTS_REJECTED,
        payload: 'No web3 object available',
        error: true,
      });
    }
  };
}

// TODO: Move these to a better place?
interface MilestoneData {
  title: string;
  description: string;
  date: string;
  payoutPercent: number;
  immediatePayout: boolean;
}

interface ProposalContractData {
  ethAmount: number | string; // TODO: BigNumber
  payOutAddress: string;
  trusteesAddresses: string[];
  milestoneAmounts: number[] | string[]; // TODO: BigNumber
  milestones: MilestoneData[];
  durationInMinutes: number;
  milestoneVotingPeriodInMinutes: number;
  immediateFirstMilestonePayout: boolean;
}

interface ProposalBackendData {
  title: string;
  content: string;
  category: PROPOSAL_CATEGORY;
}

export type TCreateCrowdFund = typeof createCrowdFund;
export function createCrowdFund(
  CrowdFundFactoryContract: any,
  contractData: ProposalContractData,
  backendData: ProposalBackendData,
) {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    dispatch({
      type: types.CROWD_FUND_PENDING,
    });

    const {
      ethAmount,
      payOutAddress,
      trusteesAddresses,
      milestoneAmounts,
      milestones,
      durationInMinutes,
      milestoneVotingPeriodInMinutes,
      immediateFirstMilestonePayout,
    } = contractData;

    const { content, title, category } = backendData;

    const state = getState();
    const accounts = state.web3.accounts;

    try {
      await CrowdFundFactoryContract.methods
        .createCrowdFund(
          ethAmount,
          payOutAddress,
          [payOutAddress, ...trusteesAddresses],
          milestoneAmounts,
          durationInMinutes,
          milestoneVotingPeriodInMinutes,
          immediateFirstMilestonePayout,
        )
        .send({ from: accounts[0] })
        .once('confirmation', async (_: any, receipt: any) => {
          const crowdFundContractAddress =
            receipt.events.ContractCreated.returnValues.newAddress;
          await postProposal({
            accountAddress: accounts[0],
            crowdFundContractAddress,
            content,
            title,
            milestones,
            category,
          });
          dispatch({
            type: types.CROWD_FUND_CREATED,
            payload: crowdFundContractAddress,
          });
          // TODO: Type me as promise dispatch
          (dispatch as any)(fetchProposals()).catch(handleWrongNetworkError(dispatch));
        });
    } catch (err) {
      dispatch({
        type: types.CROWD_FUND_REJECTED,
        payload: err.message || err.toString(),
        error: true,
      });
    }
  };
}

export type TRequestMilestonePayout = typeof requestMilestonePayout;
export function requestMilestonePayout(crowdFundContract: any, index: number) {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    dispatch({
      type: types.REQUEST_MILESTONE_PAYOUT_PENDING,
    });
    const state = getState();
    const account = state.web3.accounts[0];
    try {
      await crowdFundContract.methods
        .requestMilestonePayout(index)
        .send({ from: account })
        .once('confirmation', async () => {
          await sleep(5000);
          await dispatch(fetchProposal(crowdFundContract._address));
          dispatch({
            type: types.REQUEST_MILESTONE_PAYOUT_FULFILLED,
          });
        });
    } catch (err) {
      dispatch({
        type: types.REQUEST_MILESTONE_PAYOUT,
        payload: err.message || err.toString(),
        error: true,
      });
    }
  };
}

export type TPayMilestonePayout = typeof payMilestonePayout;
export function payMilestonePayout(crowdFundContract: any, index: number) {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    dispatch({
      type: types.PAY_MILESTONE_PAYOUT_PENDING,
    });
    const state = getState();
    const account = state.web3.accounts[0];
    try {
      await crowdFundContract.methods
        .payMilestonePayout(index)
        .send({ from: account })
        .once('confirmation', async () => {
          await sleep(5000);
          await dispatch(fetchProposal(crowdFundContract._address));
          dispatch({
            type: types.PAY_MILESTONE_PAYOUT_FULFILLED,
          });
        });
    } catch (err) {
      console.error('Pay milestone payout failed:', err);
      dispatch({
        type: types.PAY_MILESTONE_PAYOUT_REJECTED,
        payload: err.message || err.toString(),
        error: true,
      });
    }
  };
}

// TODO: BigNumber me
export type TSendTransaction = typeof fundCrowdFund;
export function fundCrowdFund(crowdFundContract: any, value: number | string) {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    dispatch({
      type: types.SEND_PENDING,
    });
    const state = getState();
    const web3 = state.web3.web3;
    const account = state.web3.accounts[0];

    try {
      await crowdFundContract.methods
        .contribute()
        .send({ from: account, value: web3.utils.toWei(String(value), 'ether') })
        .once('confirmation', async () => {
          await sleep(5000);
          await dispatch(fetchProposal(crowdFundContract._address));
          dispatch({
            type: types.SEND_FULFILLED,
          });
        });
    } catch (err) {
      console.log(err);
      dispatch({
        type: types.SEND_REJECTED,
        payload: err.message || err.toString(),
        error: true,
      });
    }
  };
}

export function voteMilestonePayout(
  crowdFundContract: any,
  index: number,
  vote: boolean,
) {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    dispatch({ type: types.VOTE_AGAINST_MILESTONE_PAYOUT_PENDING });
    const state = getState();
    const account = state.web3.accounts[0];

    try {
      await crowdFundContract.methods
        .voteMilestonePayout(index, vote)
        .send({ from: account })
        .once('confirmation', async () => {
          await sleep(5000);
          await dispatch(fetchProposal(crowdFundContract._address));
          dispatch({ type: types.VOTE_AGAINST_MILESTONE_PAYOUT_FULFILLED });
        });
    } catch (err) {
      console.error('Vote against payout failed:', err);
      dispatch({
        type: types.VOTE_AGAINST_MILESTONE_PAYOUT_REJECTED,
        payload: err.message || err.toString(),
        error: true,
      });
    }
  };
}

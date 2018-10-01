import types from './types';
import { Dispatch } from 'redux';
import getWeb3 from 'lib/getWeb3';
import { postProposal } from 'api/api';
import getContract, { WrongNetworkError } from 'lib/getContract';
import { sleep } from 'utils/helpers';
import { fetchProposal, fetchProposals } from 'modules/proposals/actions';
import { PROPOSAL_CATEGORY } from 'api/constants';
import { AppState } from 'store/reducers';
import { Wei } from 'utils/units';
import { TeamMember } from 'modules/create/types';

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
    return dispatch({
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

export interface ProposalContractData {
  ethAmount: Wei;
  payOutAddress: string;
  trusteesAddresses: string[];
  milestoneAmounts: Wei[];
  milestones: MilestoneData[];
  durationInMinutes: number;
  milestoneVotingPeriodInMinutes: number;
  immediateFirstMilestonePayout: boolean;
}

export interface ProposalBackendData {
  title: string;
  content: string;
  category: PROPOSAL_CATEGORY;
  team: TeamMember[];
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

    const { content, title, category, team } = backendData;

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
            team,
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

export function resetCreateCrowdFund() {
  return { type: types.RESET_CROWD_FUND };
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

export function voteRefund(crowdFundContract: any, vote: boolean) {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    dispatch({ type: types.VOTE_REFUND_PENDING });
    const state = getState();
    const account = state.web3.accounts[0];

    try {
      await crowdFundContract.methods
        .voteRefund(vote)
        .send({ from: account })
        .once('confirmation', async () => {
          await sleep(5000);
          await dispatch(fetchProposal(crowdFundContract._address));
          dispatch({ type: types.VOTE_REFUND_FULFILLED });
        });
    } catch (err) {
      dispatch({
        type: types.VOTE_REFUND_REJECTED,
        payload: err.message || err.toString(),
        error: true,
      });
    }
  };
}

async function freezeContract(crowdFundContract: any, account: string) {
  let isFrozen = await crowdFundContract.methods.frozen().call({ from: account });
  // Already frozen, all good here
  if (isFrozen) {
    return;
  }

  await new Promise((resolve, reject) => {
    crowdFundContract.methods
      .refund()
      .send({ from: account })
      .once('confirmation', async () => {
        await sleep(5000);
        isFrozen = await crowdFundContract.methods.frozen().call({ from: account });
        resolve();
      })
      .catch((err: Error) => reject(err));
  });
  if (!isFrozen) {
    throw new Error('Proposal isn’t in a refundable state yet.');
  }
}

export function triggerRefund(crowdFundContract: any) {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    dispatch({ type: types.WITHDRAW_REFUND_PENDING });
    const state = getState();
    const account = state.web3.accounts[0];

    try {
      await freezeContract(crowdFundContract, account);
      await dispatch(fetchProposal(crowdFundContract._address));
      dispatch({ type: types.TRIGGER_REFUND_FULFILLED });
    } catch (err) {
      dispatch({
        type: types.TRIGGER_REFUND_REJECTED,
        payload: err.message || err.toString(),
        error: true,
      });
    }
  };
}

export function withdrawRefund(crowdFundContract: any, address: string) {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    dispatch({ type: types.WITHDRAW_REFUND_PENDING });
    const state = getState();
    const account = state.web3.accounts[0];

    try {
      await freezeContract(crowdFundContract, account);
      await crowdFundContract.methods
        .withdraw(address)
        .send({ from: account })
        .once('confirmation', async () => {
          await sleep(5000);
          await dispatch(fetchProposal(crowdFundContract._address));
          dispatch({ type: types.WITHDRAW_REFUND_FULFILLED });
        });
    } catch (err) {
      dispatch({
        type: types.WITHDRAW_REFUND_REJECTED,
        payload: err.message || err.toString(),
        error: true,
      });
    }
  };
}

// TODO: Fill me out with all param types.
// TODO: _ will be primaryType for EIP-712
export function signData(data: any, dataTypes: any, _: string) {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    dispatch({ type: types.SIGN_DATA_PENDING });
    const state = getState();
    const { web3, accounts } = state.web3;
    // Needed for EIP-712
    // const chainId = await web3.eth.net.getId();

    return new Promise((resolve, reject) => {
      try {
        // TODO: This typing is hella broken
        (web3.currentProvider as any).sendAsync(
          {
            method: 'eth_signTypedData',
            params: [
              Object.keys(dataTypes).map(k => ({
                ...dataTypes[k],
                value: data[k],
              })),
              accounts[0],
            ],
            // EIP-712
            // params: [JSON.stringify({
            //   primaryType,
            //   domain: {
            //     origin: window.location.origin,
            //     version: 1,
            //     chainId,
            //   },
            //   types: dataTypes,
            //   message: data,
            // }), accounts[0]],
          },
          (err: Error | undefined, res: any) => {
            console.log(err, res);
            if (err) {
              throw err;
            }
            if (res.error) {
              throw new Error(res.error.message);
            }
            dispatch({ type: types.SIGN_DATA_FULFILLED, payload: res.result });
            resolve(res.result);
          },
        );
      } catch (err) {
        console.error(err);
        dispatch({
          type: types.SIGN_DATA_REJECTED,
          payload: err.message || err.toString(),
          error: true,
        });
        reject(err);
      }
    });
  };
}

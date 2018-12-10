import types from './types';
import { Dispatch } from 'redux';
import getWeb3, { initializeWeb3 } from 'lib/getWeb3';
import { WrongNetworkError } from 'lib/getContract';
import { sleep } from 'utils/helpers';
import { web3ErrorToString } from 'utils/web3';
import { putProposalPublish } from 'api/api';
import { proposalToContractData } from 'modules/create/utils';
import { AppState } from 'store/reducers';
import { Wei } from 'utils/units';
import { AuthSignatureData, ProposalDraft, ProposalWithCrowdFund } from 'types';
import {
  fetchProposal,
  fetchProposals,
  postProposalContribution,
} from 'modules/proposals/actions';
import { getCrowdFundContract } from 'lib/crowdFundContracts';
import { getCrowdFundFactoryContract } from 'lib/crowdFundFactoryContract';

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
      payload: initializeWeb3(),
    });
  };
}

export function checkNetwork() {
  return async (dispatch: Dispatch<any>) => {
    try {
      await getCrowdFundFactoryContract(getWeb3());
    } catch (err) {
      handleWrongNetworkError(dispatch)(err);
    }
  };
}

export function enableWeb3() {
  return { type: types.ENABLE_WEB3_PENDING };
}

export type TSetAccounts = typeof setAccounts;
export function setAccounts() {
  return (dispatch: Dispatch<any>) => {
    const web3 = getWeb3();
    if (web3) {
      dispatch({ type: types.ACCOUNTS_PENDING });

      web3.eth
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
export interface ProposalContractData {
  ethAmount: Wei;
  payoutAddress: string;
  trusteesAddresses: string[];
  milestoneAmounts: Wei[];
  durationInMinutes: number;
  milestoneVotingPeriodInMinutes: number;
  immediateFirstMilestonePayout: boolean;
}

export type TCreateCrowdFund = typeof createCrowdFund;
export function createCrowdFund(proposal: ProposalDraft) {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    dispatch({
      type: types.CROWD_FUND_PENDING,
    });

    const {
      ethAmount,
      payoutAddress,
      trusteesAddresses,
      milestoneAmounts,
      durationInMinutes,
      milestoneVotingPeriodInMinutes,
      immediateFirstMilestonePayout,
    } = proposalToContractData(proposal);

    const state = getState();
    const accounts = state.web3.accounts;

    try {
      const CrowdFundFactoryContract = await getCrowdFundFactoryContract(getWeb3());
      await CrowdFundFactoryContract.methods
        .createCrowdFund(
          ethAmount,
          payoutAddress,
          [payoutAddress, ...trusteesAddresses],
          milestoneAmounts,
          durationInMinutes,
          milestoneVotingPeriodInMinutes,
          immediateFirstMilestonePayout,
        )
        .send({ from: accounts[0] })
        .once('confirmation', async (_: any, receipt: any) => {
          const crowdFundContractAddress =
            receipt.events.ContractCreated.returnValues.newAddress;
          await putProposalPublish(proposal, crowdFundContractAddress);
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
export function requestMilestonePayout(proposal: ProposalWithCrowdFund, index: number) {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    dispatch({
      type: types.REQUEST_MILESTONE_PAYOUT_PENDING,
    });
    const state = getState();
    const account = state.web3.accounts[0];
    const { proposalAddress, proposalId } = proposal;
    const crowdFundContract = await getCrowdFundContract(getWeb3(), proposalAddress);

    try {
      await crowdFundContract.methods
        .requestMilestonePayout(index)
        .send({ from: account })
        .once('confirmation', async () => {
          await sleep(5000);
          await dispatch(fetchProposal(proposalId));
          dispatch({
            type: types.REQUEST_MILESTONE_PAYOUT_FULFILLED,
          });
        });
    } catch (err) {
      dispatch({
        type: types.REQUEST_MILESTONE_PAYOUT_REJECTED,
        payload: err.message || err.toString(),
        error: true,
      });
    }
  };
}

export type TPayMilestonePayout = typeof payMilestonePayout;
export function payMilestonePayout(proposal: ProposalWithCrowdFund, index: number) {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    dispatch({
      type: types.PAY_MILESTONE_PAYOUT_PENDING,
    });
    const state = getState();
    const account = state.web3.accounts[0];
    const { proposalAddress, proposalId } = proposal;
    const crowdFundContract = await getCrowdFundContract(getWeb3(), proposalAddress);

    try {
      await crowdFundContract.methods
        .payMilestonePayout(index)
        .send({ from: account })
        .once('confirmation', async () => {
          await sleep(5000);
          await dispatch(fetchProposal(proposalId));
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
export function fundCrowdFund(proposal: ProposalWithCrowdFund, value: number | string) {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    dispatch({
      type: types.SEND_PENDING,
    });
    const state = getState();
    const web3 = getWeb3();
    const account = state.web3.accounts[0];
    const { proposalAddress, proposalId } = proposal;
    const crowdFundContract = await getCrowdFundContract(web3, proposalAddress);

    const handleErr = (err: Error) => {
      dispatch({
        type: types.SEND_REJECTED,
        payload: err.message || err.toString(),
        error: true,
      });
    };

    try {
      if (!web3) {
        throw new Error('No web3 instance available');
      }
      await crowdFundContract.methods
        .contribute()
        .send({ from: account, value: web3.utils.toWei(String(value), 'ether') })
        .once('confirmation', async (_: number, receipt: any) => {
          try {
            await sleep(5000);
            await dispatch(
              postProposalContribution(
                proposalId,
                receipt.transactionHash,
                account,
                String(value),
              ),
            );
            await dispatch(fetchProposal(proposalId));
            dispatch({
              type: types.SEND_FULFILLED,
            });
          } catch (err) {
            handleErr(err);
          }
        });
    } catch (err) {
      handleErr(err);
    }
  };
}

export function voteMilestonePayout(
  proposal: ProposalWithCrowdFund,
  index: number,
  vote: boolean,
) {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    dispatch({ type: types.VOTE_AGAINST_MILESTONE_PAYOUT_PENDING });
    const state = getState();
    const account = state.web3.accounts[0];
    const { proposalAddress, proposalId } = proposal;
    const crowdFundContract = await getCrowdFundContract(getWeb3(), proposalAddress);

    try {
      await crowdFundContract.methods
        .voteMilestonePayout(index, vote)
        .send({ from: account })
        .once('confirmation', async () => {
          await sleep(5000);
          await dispatch(fetchProposal(proposalId));
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

export function voteRefund(proposal: ProposalWithCrowdFund, vote: boolean) {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    dispatch({ type: types.VOTE_REFUND_PENDING });
    const state = getState();
    const account = state.web3.accounts[0];
    const { proposalAddress, proposalId } = proposal;
    const crowdFundContract = await getCrowdFundContract(getWeb3(), proposalAddress);

    try {
      await crowdFundContract.methods
        .voteRefund(vote)
        .send({ from: account })
        .once('confirmation', async () => {
          await sleep(5000);
          await dispatch(fetchProposal(proposalId));
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

export function triggerRefund(proposal: ProposalWithCrowdFund) {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    dispatch({ type: types.WITHDRAW_REFUND_PENDING });
    const state = getState();
    const account = state.web3.accounts[0];
    const { proposalAddress, proposalId } = proposal;
    const crowdFundContract = await getCrowdFundContract(getWeb3(), proposalAddress);

    try {
      await freezeContract(crowdFundContract, account);
      await dispatch(fetchProposal(proposalId));
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

export function withdrawRefund(proposal: ProposalWithCrowdFund, address: string) {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    dispatch({ type: types.WITHDRAW_REFUND_PENDING });
    const state = getState();
    const account = state.web3.accounts[0];
    const { proposalAddress, proposalId } = proposal;
    const crowdFundContract = await getCrowdFundContract(getWeb3(), proposalAddress);

    try {
      await freezeContract(crowdFundContract, account);
      await crowdFundContract.methods
        .withdraw(address)
        .send({ from: account })
        .once('confirmation', async () => {
          await sleep(5000);
          await dispatch(fetchProposal(proposalId));
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

// TODO: Fill out params with typed data
export function signData(data: object, dataTypes: object, primaryType: string) {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    dispatch({ type: types.SIGN_DATA_PENDING });
    const state = getState();
    const { accounts } = state.web3;
    const web3 = getWeb3();

    return new Promise(async (resolve, reject) => {
      const handleErr = (err: any) => {
        console.error(err);
        dispatch({
          type: types.SIGN_DATA_REJECTED,
          payload: err.message || err.toString(),
          error: true,
        });
        reject(err);
      };

      try {
        const chainId = await web3.eth.net.getId();
        const rawTypedData = {
          domain: {
            name: 'Grant.io',
            version: 1,
            chainId,
          },
          types: {
            ...dataTypes,
            EIP712Domain: [
              { name: 'name', type: 'string' },
              { name: 'version', type: 'string' },
              { name: 'chainId', type: 'uint256' },
            ],
          },
          message: data,
          primaryType,
        };

        (web3.currentProvider as any).send(
          {
            method: 'eth_signTypedData_v3',
            params: [accounts[0], JSON.stringify(rawTypedData)],
            from: accounts[0],
          },
          (err: Error | undefined, res: any) => {
            if (err) {
              return handleErr(err);
            }
            if (res.error) {
              const msg = web3ErrorToString(res.error);
              return handleErr(new Error(msg));
            }
            const payload: AuthSignatureData = {
              signedMessage: res.result,
              rawTypedData,
            };
            dispatch({ type: types.SIGN_DATA_FULFILLED, payload });
            resolve(payload);
          },
        );
      } catch (err) {
        handleErr(err);
      }
    });
  };
}

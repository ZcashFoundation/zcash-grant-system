import { AppState } from 'store/reducers';

export function findCrowdFund(state: AppState, contractAddress) {
  const { crowdFunds } = state.web3;
  return crowdFunds.find(crowdFund => {
    return crowdFund.crowdFundContract._address === contractAddress;
  });
}

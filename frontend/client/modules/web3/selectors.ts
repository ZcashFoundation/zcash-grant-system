import { AppState } from 'store/reducers';

export function selectWeb3(state: AppState) {
  return state.web3.web3;
}

export function findContract(state: AppState, contractAddress: string) {
  const { contracts } = state.web3;
  return contracts.find(contract => contract._address === contractAddress);
}

import { AppState } from 'store/reducers';

export function findContract(state: AppState, contractAddress: string) {
  const { contracts } = state.web3;
  return contracts.find(contract => contract._address === contractAddress);
}

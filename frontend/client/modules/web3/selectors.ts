import { AppState } from 'store/reducers';

export function selectIsMissingWeb3(state: AppState) {
  return state.web3.isMissingWeb3;
}

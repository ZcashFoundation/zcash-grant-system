import { StoreState as S } from './reducer';

export const getWatchAddresses = (s: S) => s.watchAddresses;
export const getAddressByContributionId = (s: S, cid: string): string | undefined =>
  s.watchAddressMap[cid];

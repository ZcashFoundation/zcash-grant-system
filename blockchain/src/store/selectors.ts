import { StoreState as S } from './reducer';
import { AddressCollection } from './types'

export const getWatchAddresses = (s: S) => s.watchAddresses;
export const getAddressesByContributionId = (s: S, cid: string): AddressCollection | undefined =>
  s.watchAddressMap[cid];
export const getWatchDisclosures = (s: S) => s.watchDisclosures;
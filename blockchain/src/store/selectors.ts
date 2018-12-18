import { StoreState as S } from './reducer';
import { AddressCollection } from './types'

export const getWatchAddresses = (s: S) => s.watchAddresses;
export const getAddressesByContributionId = (s: S, cid: number): AddressCollection | undefined =>
  s.watchAddresses[cid];

export const getWatchDisclosures = (s: S) => s.watchDisclosures;
export const getWatchDisclosureByContributionId = (s: S, cid: number): string | undefined =>
  s.watchDisclosures[cid];

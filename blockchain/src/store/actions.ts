import type, { AddressCollection } from './types';
import { deriveTransparentAddress } from '../util';
import { getNetwork } from '../node';
import env from '../env';

export function generateAddresses(contributionId: string) {
  // 2^31 is the maximum number of BIP32 addresses
  const index = Math.floor(Math.random() * Math.pow(2, 31));
  const addresses: AddressCollection = {
    transparent: deriveTransparentAddress(index, getNetwork()),
    sprout: env.SPROUT_ADDRESS,
  };
  return {
    type: type.GENERATE_ADDRESSES,
    payload: {
      addresses,
      contributionId,
    },
  };
}


export type ActionTypes =
  ReturnType<typeof generateAddresses>;
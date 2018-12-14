import type, { AddressCollection } from './types';
import { deriveTransparentAddress } from '../util';
import env from '../env';

export function generateAddresses(contributionId: string) {
  // 2^31 is the maximum number of BIP32 addresses
  const index = Math.floor(Math.random() * Math.pow(2, 31));
  const addresses: AddressCollection = {
    transparent: deriveTransparentAddress(index),
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

// export function addDisclosure() {
//   return {
//     type: type.ADD_DISCLOSURE,
//   };
// }

export type ActionTypes =
  ReturnType<typeof generateAddresses>;
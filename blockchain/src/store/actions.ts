import type from './types';
import { deriveAddress } from '../util';

export function generateAddress(contributionId: string) {
  // 2^31 is the maximum number of BIP32 addresses
  const index = Math.floor(Math.random() * Math.pow(2, 31));
  const address = deriveAddress(index);
  return {
    type: type.GENERATE_ADDRESS,
    payload: {
      address,
      contributionId,
    },
  };
}

// export function addDisclosure() {
//   return {
//     type: type.ADD_DISCLOSURE,
//   };
// }

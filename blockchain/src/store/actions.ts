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
    type: type.GENERATE_ADDRESSES as type.GENERATE_ADDRESSES,
    payload: {
      addresses,
      contributionId,
    },
  };
}

export function addPaymentDisclosure(disclosureHex: string) {
  return {
    type: type.ADD_PAYMENT_DISCLOSURE as type.ADD_PAYMENT_DISCLOSURE,
    payload: disclosureHex,
  };
}

export function confirmPaymentDisclosure(disclosureHex: string) {
  return {
    type: type.CONFIRM_PAYMENT_DISCLOSURE as type.CONFIRM_PAYMENT_DISCLOSURE,
    payload: disclosureHex,
  };
}

export type ActionTypes =
  | ReturnType<typeof generateAddresses>
  | ReturnType<typeof addPaymentDisclosure>
  | ReturnType<typeof confirmPaymentDisclosure>;
import type, { AddressCollection } from './types';
import { deriveTransparentAddress } from '../util';
import { getNetwork } from '../node';
import { getContributionAddress } from '../bitgo';
import env from '../env';

export function setStartingBlockHeight(height: string | number) {
  return {
    type: type.SET_STARTING_BLOCK_HEIGHT as type.SET_STARTING_BLOCK_HEIGHT,
    payload: parseInt(height.toString(), 10),
  }
}

export async function generateAddresses(contributionId: number) {
  let transparent;
  if (env.BITGO_WALLET_ID) {
    transparent = await getContributionAddress(contributionId);
  } else {
    transparent = deriveTransparentAddress(contributionId, getNetwork());
  }

  const addresses: AddressCollection = {
    transparent,
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

export function addPaymentDisclosure(contributionId: number, disclosure: string) {
  return {
    type: type.ADD_PAYMENT_DISCLOSURE as type.ADD_PAYMENT_DISCLOSURE,
    payload: {
      contributionId,
      disclosure,
    },
  };
}

export function confirmPaymentDisclosure(contributionId: number, disclosure: string) {
  return {
    type: type.CONFIRM_PAYMENT_DISCLOSURE as type.CONFIRM_PAYMENT_DISCLOSURE,
    payload: {
      contributionId,
      disclosure,
    },
  };
}

export type ActionTypes =
  | ReturnType<typeof setStartingBlockHeight>
  | ReturnType<typeof generateAddresses>
  | ReturnType<typeof addPaymentDisclosure>
  | ReturnType<typeof confirmPaymentDisclosure>;

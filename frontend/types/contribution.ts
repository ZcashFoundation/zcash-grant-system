import { Zat } from 'utils/units';
import { Proposal, User } from 'types';

export interface Contribution {
  id: number;
  txId: string;
  amount: string;
  dateCreated: number;
  status: 'PENDING' | 'CONFIRMED';
}

export interface ContributionWithAddresses extends Contribution {
  addresses: {
    transparent: string;
    // TODO: Add sapling and memo in when ready
    // sprout: string;
    // memo: string;
  };
}

export interface ContributionWithUser extends Contribution {
  user: User;
}

export type ContributionWithAddressesAndUser = ContributionWithAddresses &
  ContributionWithUser;

export interface UserContribution extends Omit<Contribution, 'amount' | 'txId'> {
  amount: Zat;
  txId?: string;
  proposal: Proposal;
}

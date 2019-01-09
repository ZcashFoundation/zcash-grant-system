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
    sprout: string;
    transparent: string;
    memo: string;
  };
}

export interface ContributionWithUser extends Contribution {
  user: User;
}

export interface UserContribution extends Omit<Contribution, 'amount' | 'txId'> {
  amount: Zat;
  txId?: string;
  proposal: Proposal;
}

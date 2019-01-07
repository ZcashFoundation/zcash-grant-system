export interface Contribution {
  id: string;
  txId: string;
  amount: string;
  dateCreated: number;
}

export interface ContributionWithAddresses extends Contribution {
  addresses: {
    sprout: string;
    transparent: string;
    memo: string;
  };
}

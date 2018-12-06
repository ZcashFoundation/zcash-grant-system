export interface Contribution {
  id: string;
  txId: string;
  proposalId: number;
  userId: number;
  fromAddress: string;
  amount: string;
  dateCreated: number;
}

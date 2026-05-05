export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export interface IWalletTransaction {
  _id: string;
  userId: string;
  tripId?: {
    _id: string;
    title: string;
    destination: string;
  };
  amount: number;
  type: TransactionType;
  description: string;
  createdAt: string;
}

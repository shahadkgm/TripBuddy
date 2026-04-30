import { Document, Types } from 'mongoose';

export interface IExpense {
  tripId: Types.ObjectId;
  title: string;
  amount: number;
  paidBy: string; // Name or User ID - let's use Name for simplicity as per user's snippet, but usually it's a User ID.
  // The user's snippet uses Name ("Paid By (Name)"). I'll stick to string for now to match their logic.
  splitAmong: 'All' | string[];
  createdAt: Date;
  updatedAt: Date;
}

export type IExpenseDocument = IExpense & Document;

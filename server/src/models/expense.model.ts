import { Schema, model } from 'mongoose';
import { IExpenseDocument } from '../types/expense.type';

const expenseSchema = new Schema<IExpenseDocument>(
  {
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paidBy: {
      type: String,
      required: true,
    },
    splitAmong: {
      type: Schema.Types.Mixed,
      default: 'All',
    },
  },
  {
    timestamps: true,
  }
);

export const ExpenseModel = model<IExpenseDocument>('Expense', expenseSchema);

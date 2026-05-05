import api from '../utils/api';
import { API_ENDPOINTS } from '../constants/api.constants';

export interface IExpense {
  _id: string;
  tripId: string;
  title: string;
  amount: number;
  paidBy: string;
  splitAmong: 'All' | string[];
  createdAt: string;
}

export const expenseService = {
  async addExpense(data: { tripId: string; title: string; amount: number; paidBy: string }) {
    const response = await api.post(API_ENDPOINTS.EXPENSES.BASE, data);
    return response.data.data;
  },

  async getTripExpenses(tripId: string): Promise<IExpense[]> {
    const response = await api.get(API_ENDPOINTS.EXPENSES.TRIP_EXPENSES(tripId));
    return response.data.data;
  },

  async deleteExpense(expenseId: string) {
    const response = await api.delete(API_ENDPOINTS.EXPENSES.DELETE(expenseId));
    return response.data;
  },
};

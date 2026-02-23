import api from "../utils/api";

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
        const response = await api.post("/api/expenses", data);
        return response.data;
    },

    async getTripExpenses(tripId: string): Promise<IExpense[]> {
        const response = await api.get(`/api/expenses/trip/${tripId}`);
        return response.data;
    },

    async deleteExpense(expenseId: string) {
        const response = await api.delete(`/api/expenses/${expenseId}`);
        return response.data;
    }
};

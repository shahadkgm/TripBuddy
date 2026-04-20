import api from '../utils/api';
import type { ApiResponse } from '../interface/ApiResponse';
import type { IPayment } from '../interface/IPayment';

export const paymentService = {
  async createStripeSession(amount: number, tripId: string): Promise<{ id: string; url: string }> {
    const response = await api.post<ApiResponse<any>>(`/api/payments/create-stripe-session`, {
      amount,
      tripId,
    });
    return response.data.data;
  },

  async verifyStripePayment(verificationData: {
    sessionId: string;
    tripId: string;
  }): Promise<IPayment> {
    const response = await api.post<ApiResponse<IPayment>>(
      `/api/payments/verify-stripe-payment`,
      verificationData
    );
    return response.data.data;
  },

  async payDeposit(tripId: string, amount: number): Promise<IPayment> {
    const response = await api.post<ApiResponse<IPayment>>(`/api/payments/pay-deposit`, {
      tripId,
      amount,
    });
    return response.data.data;
  },

  async payWithWallet(tripId: string, amount: number): Promise<IPayment> {
    const response = await api.post<ApiResponse<IPayment>>(`/api/payments/pay-with-wallet`, {
      tripId,
      amount,
    });
    return response.data.data;
  },

  async getMyPayments(tripId: string): Promise<IPayment[]> {
    const response = await api.get<ApiResponse<IPayment[]>>(`/api/payments/my-payments/${tripId}`);
    return response.data.data;
  },

  async getTripPayments(tripId: string): Promise<IPayment[]> {
    const response = await api.get<ApiResponse<IPayment[]>>(
      `/api/payments/trip-payments/${tripId}`
    );
    return response.data.data;
  },

  async getUserPayments(): Promise<IPayment[]> {
    const response = await api.get<ApiResponse<IPayment[]>>(`/api/payments/user-payments`);
    return response.data.data;
  },
};

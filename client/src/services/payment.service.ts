import api from '../utils/api';
import { API_ENDPOINTS } from '../constants/api.constants';
import type { ApiResponse } from '../interface/ApiResponse';
import type { IPayment } from '../interface/IPayment';
import type { IWalletTransaction } from '../interface/IWalletTransaction';

export const paymentService = {
  async createStripeSession(amount: number, tripId: string): Promise<{ id: string; url: string }> {
    const response = await api.post<ApiResponse<{ id: string; url: string }>>(
      API_ENDPOINTS.PAYMENTS.CREATE_STRIPE_SESSION,
      {
        amount,
        tripId,
      }
    );
    return response.data.data;
  },

  async verifyStripePayment(verificationData: {
    sessionId: string;
    tripId: string;
  }): Promise<IPayment> {
    const response = await api.post<ApiResponse<IPayment>>(
      API_ENDPOINTS.PAYMENTS.VERIFY_STRIPE_PAYMENT,
      verificationData
    );
    return response.data.data;
  },

  async payDeposit(tripId: string, amount: number): Promise<IPayment> {
    const response = await api.post<ApiResponse<IPayment>>(API_ENDPOINTS.PAYMENTS.PAY_DEPOSIT, {
      tripId,
      amount,
    });
    return response.data.data;
  },

  async payWithWallet(tripId: string, amount: number): Promise<IPayment> {
    const response = await api.post<ApiResponse<IPayment>>(API_ENDPOINTS.PAYMENTS.PAY_WITH_WALLET, {
      tripId,
      amount,
    });
    return response.data.data;
  },

  async getMyPayments(tripId: string): Promise<IPayment[]> {
    const response = await api.get<ApiResponse<IPayment[]>>(API_ENDPOINTS.PAYMENTS.MY_PAYMENTS(tripId));
    return response.data.data;
  },

  async getTripPayments(tripId: string): Promise<IPayment[]> {
    const response = await api.get<ApiResponse<IPayment[]>>(
      API_ENDPOINTS.PAYMENTS.TRIP_PAYMENTS(tripId)
    );
    return response.data.data;
  },

  async getUserPayments(): Promise<IPayment[]> {
    const response = await api.get<ApiResponse<IPayment[]>>(API_ENDPOINTS.PAYMENTS.USER_PAYMENTS);
    return response.data.data;
  },
 
  async getWalletTransactions(): Promise<IWalletTransaction[]> {
    const response = await api.get<ApiResponse<IWalletTransaction[]>>(
      API_ENDPOINTS.PAYMENTS.WALLET_TRANSACTIONS
    );
    return response.data.data;
  },
};

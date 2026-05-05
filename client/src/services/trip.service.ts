import api from '../utils/api';
import { API_ENDPOINTS } from '../constants/api.constants';
import type { ITrip, ITripFilters, PaginatedTrips } from '../interface/ITripdetails';
import type { ApiResponse } from '../interface/ApiResponse';
import type { IMessage } from '../interface/IMessage';

export const tripService = {
  async getAllTrips(filters: ITripFilters): Promise<PaginatedTrips> {
    const response = await api.get<ApiResponse<PaginatedTrips>>(API_ENDPOINTS.TRIPS.ALL, {
      params: filters,
    });
    return response.data.data;
  },

  async createTrip(data: Partial<ITrip> | FormData): Promise<ITrip> {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await api.post<ApiResponse<ITrip>>(API_ENDPOINTS.TRIPS.BASE, data, {
      headers,
    });
    return response.data.data;
  },

  async getUserTrips(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedTrips> {
    const response = await api.get<ApiResponse<PaginatedTrips>>(API_ENDPOINTS.TRIPS.USER_TRIPS(userId), {
      params: { page, limit },
    });
    return response.data.data;
  },

  async getTripById(id: string): Promise<ITrip> {
    const response = await api.get<ApiResponse<ITrip>>(API_ENDPOINTS.TRIPS.DETAILS(id));
    return response.data.data;
  },

  async updateTrip(id: string, data: Partial<ITrip> | FormData): Promise<ITrip> {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await api.patch<ApiResponse<ITrip>>(API_ENDPOINTS.TRIPS.DETAILS(id), data, { headers });
    return response.data.data;
  },

  async getChatHistory(
    tripId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ messages: IMessage[]; total: number }> {
    const response = await api.get<ApiResponse<{ messages: IMessage[]; total: number }>>(
      API_ENDPOINTS.TRIPS.CHAT(tripId),
      {
        params: { page, limit },
      }
    );
    return response.data.data;
  },

  async finalizeTrip(id: string, budget: number, depositAmount: number): Promise<ITrip> {
    const response = await api.post<ApiResponse<ITrip>>(API_ENDPOINTS.TRIPS.FINALIZE(id), {
      budget,
      depositAmount,
    });
    return response.data.data;
  },

  async cancelTrip(id: string): Promise<ITrip> {
    const response = await api.post<ApiResponse<ITrip>>(API_ENDPOINTS.TRIPS.CANCEL(id));
    return response.data.data;
  },

  async assignGuide(tripId: string, guideId: string | null): Promise<ITrip> {
    const response = await api.patch<ApiResponse<ITrip>>(API_ENDPOINTS.TRIPS.UPDATE_GUIDE(tripId), {
      guideId,
    });
    return response.data.data;
  },

  async getGuideTrips(
    guideId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedTrips> {
    const response = await api.get<ApiResponse<PaginatedTrips>>(API_ENDPOINTS.TRIPS.GUIDE_TRIPS(guideId), {
      params: { page, limit },
    });
    return response.data.data;
  },

  async completeTrip(id: string): Promise<ITrip> {
    const response = await api.post<ApiResponse<ITrip>>(API_ENDPOINTS.TRIPS.COMPLETE(id));
    return response.data.data;
  },
};

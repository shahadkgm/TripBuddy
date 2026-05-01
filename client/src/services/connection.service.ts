import api from '../utils/api';
import { API_ENDPOINTS } from '../constants/api.constants';

export const connectionService = {
  async sendRequest(receiverId: string, tripId?: string) {
    const response = await api.post(API_ENDPOINTS.CONNECTIONS.REQUEST, { receiverId, tripId });
    return response.data.data;
  },

  async getStatus(receiverId: string, tripId?: string) {
    const response = await api.get(API_ENDPOINTS.CONNECTIONS.STATUS, { params: { receiverId, tripId } });
    return response.data.data?.status;
  },

  async getPendingRequests() {
    const response = await api.get(API_ENDPOINTS.CONNECTIONS.PENDING);
    return response.data.data;
  },

  async getSentRequests(page?: number, limit?: number) {
    const response = await api.get(API_ENDPOINTS.CONNECTIONS.MY_REQUESTS, { params: { page, limit } });
    return response.data.data;
  },

  async acceptRequest(requestId: string) {
    const response = await api.patch(API_ENDPOINTS.CONNECTIONS.ACCEPT(requestId));
    return response.data.data;
  },

  async rejectRequest(requestId: string) {
    const response = await api.patch(API_ENDPOINTS.CONNECTIONS.REJECT(requestId));
    return response.data.data;
  },

  async getTripMembers(tripId: string) {
    const response = await api.get(API_ENDPOINTS.CONNECTIONS.MEMBERS(tripId));
    return response.data.data;
  },
};

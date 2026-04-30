import api from '../utils/api';

export const connectionService = {
  async sendRequest(receiverId: string, tripId?: string) {
    const response = await api.post('/api/connections/request', { receiverId, tripId });
    return response.data.data;
  },

  async getStatus(receiverId: string, tripId?: string) {
    const response = await api.get('/api/connections/status', { params: { receiverId, tripId } });
    return response.data.data?.status;
  },

  async getPendingRequests() {
    const response = await api.get('/api/connections/pending');
    return response.data.data;
  },

  async getSentRequests(page?: number, limit?: number) {
    const response = await api.get('/api/connections/my-requests', { params: { page, limit } });
    return response.data.data;
  },

  async acceptRequest(requestId: string) {
    const response = await api.patch(`/api/connections/accept/${requestId}`);
    return response.data.data;
  },

  async rejectRequest(requestId: string) {
    const response = await api.patch(`/api/connections/reject/${requestId}`);
    return response.data.data;
  },

  async getTripMembers(tripId: string) {
    const response = await api.get(`/api/connections/members/${tripId}`);
    return response.data.data;
  },
};

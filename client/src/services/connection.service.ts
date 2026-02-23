import api from "../utils/api";

export const connectionService = {
    async sendRequest(receiverId: string, tripId?: string) {
        const response = await api.post("/api/connections/request", { receiverId, tripId });
        return response.data;
    },

    async getStatus(receiverId: string, tripId?: string) {
        const response = await api.get("/api/connections/status", { params: { receiverId, tripId } });
        return response.data.status;
    },

    async getPendingRequests() {
        const response = await api.get("/api/connections/pending");
        return response.data;
    },

    async acceptRequest(requestId: string) {
        const response = await api.patch(`/api/connections/accept/${requestId}`);
        return response.data;
    },

    async rejectRequest(requestId: string) {
        const response = await api.patch(`/api/connections/reject/${requestId}`);
        return response.data;
    }
};

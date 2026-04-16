import api from "../utils/api";
import type { ITrip, ITripFilters, PaginatedTrips } from "../interface/ITripdetails";
import type { ApiResponse } from "../interface/ApiResponse";
import type { IMessage } from "../interface/IMessage";

export const tripService = {
    async getAllTrips(filters: ITripFilters): Promise<PaginatedTrips> {
        const response = await api.get<ApiResponse<PaginatedTrips>>("/api/plantrips/all", { params: filters });
        return response.data.data;
    },

    async createTrip(data: Partial<ITrip> | FormData): Promise<ITrip> {
        const headers = data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {};
        const response = await api.post<ApiResponse<ITrip>>("/api/plantrips", data, {
            headers
        });
        return response.data.data;
    },

    async getUserTrips(userId: string, page: number = 1, limit: number = 10): Promise<PaginatedTrips> {
        const response = await api.get<ApiResponse<PaginatedTrips>>(`/api/plantrips/user/${userId}`, { 
            params: { page, limit } 
        });
        return response.data.data;
    },

    async getTripById(id: string): Promise<ITrip> {
        const response = await api.get<ApiResponse<ITrip>>(`/api/plantrips/${id}`);
        return response.data.data;
    },

    async updateTrip(id: string, data: Partial<ITrip> | FormData): Promise<ITrip> {
        const headers = data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {};
        const response = await api.patch<ApiResponse<ITrip>>(`/api/plantrips/${id}`, data, { headers });
        return response.data.data;
    },

    async getChatHistory(tripId: string, page: number = 1, limit: number = 50): Promise<{ messages: IMessage[], total: number }> {
        const response = await api.get<ApiResponse<{ messages: IMessage[], total: number }>>(`/api/plantrips/${tripId}/chat`, {
            params: { page, limit }
        });
        return response.data.data;
    },

    async finalizeTrip(id: string, budget: number, depositAmount: number): Promise<ITrip> {
        const response = await api.post<ApiResponse<ITrip>>(`/api/plantrips/${id}/finalize`, { 
            budget,
            depositAmount 
        });
        return response.data.data;
    },

    async cancelTrip(id: string): Promise<ITrip> {
        const response = await api.post<ApiResponse<ITrip>>(`/api/plantrips/${id}/cancel`);
        return response.data.data;
    },

    async assignGuide(tripId: string, guideId: string | null): Promise<ITrip> {
        const response = await api.patch<ApiResponse<ITrip>>(`/api/plantrips/${tripId}/guide`, { guideId });
        return response.data.data;
    },

    async getGuideTrips(guideId: string, page: number = 1, limit: number = 10): Promise<PaginatedTrips> {
        const response = await api.get<ApiResponse<PaginatedTrips>>(`/api/plantrips/guide/${guideId}`, {
            params: { page, limit }
        });
        return response.data.data;
    },

    async completeTrip(id: string): Promise<ITrip> {
        const response = await api.post<ApiResponse<ITrip>>(`/api/plantrips/${id}/complete`);
        return response.data.data;
    }
};

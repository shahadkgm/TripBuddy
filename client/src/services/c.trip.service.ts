import api from "../utils/api";
import type { ITrip, ITripFilters, PaginatedTrips } from "../interface/ITripdetails";
import type { ApiResponse } from "../interface/ApiResponse";
import type { IMessage } from "../interface/IMessage";

export const tripService = {
    async getAllTrips(filters: ITripFilters): Promise<PaginatedTrips> {
        const response = await api.get<ApiResponse<PaginatedTrips>>("/api/plantrips/all", { params: filters });
        return response.data.data;
    },

    async createTrip(data: FormData): Promise<ITrip> {
        const response = await api.post<ApiResponse<ITrip>>("/api/plantrips", data, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.data;
    },

    async getUserTrips(userId: string): Promise<ITrip[]> {
        const response = await api.get<ApiResponse<ITrip[]>>(`/api/plantrips/user/${userId}`);
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

    async getChatHistory(tripId: string): Promise<IMessage[]> {
        const response = await api.get<ApiResponse<IMessage[]>>(`/api/plantrips/${tripId}/chat`);
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
    }
};

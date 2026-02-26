import api from "../utils/api";
import type { ITrip, ITripFilters, PaginatedTrips } from "../interface/ITripdetails";
import type { ApiResponse } from "../interface/ApiResponse";

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
};

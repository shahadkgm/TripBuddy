import api from "../utils/api";
import type { ITrip, ITripFilters, PaginatedTrips } from "../interface/ITripdetails";

export const tripService = {
    async getAllTrips(filters: ITripFilters): Promise<PaginatedTrips> {
        const response = await api.get<PaginatedTrips>("/api/plantrips/all", { params: filters });
        return response.data;
    },

    async createTrip(data: FormData): Promise<ITrip> {
        const response = await api.post<ITrip>("/api/plantrips", data, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    async getUserTrips(userId: string): Promise<ITrip[]> {
        const response = await api.get<ITrip[]>(`/api/plantrips/user/${userId}`);
        return response.data;
    },
};

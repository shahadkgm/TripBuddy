import api from "../utils/api";
import type { IGuide } from "../interface/ITripdetails";
import type { ApiResponse } from "../interface/ApiResponse";

export const guideService = {
    async updateProfile(data: FormData | Partial<IGuide>): Promise<IGuide> {
        const headers = data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {};
        const response = await api.put<ApiResponse<IGuide>>("/api/guides/profile", data, { headers });
        const updatedGuide = response.data.data;

        // Sync local storage
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            user.guideProfile = { ...user.guideProfile, ...updatedGuide };
            // Also sync avatar if updated
            if (updatedGuide.avatarURL) {
                user.avatarURL = updatedGuide.avatarURL;
            }
            localStorage.setItem("user", JSON.stringify(user));
            window.dispatchEvent(new Event("storage"));
        }

        return updatedGuide;
    },

    async getStatus(userId: string): Promise<{ exists: boolean; isVerified: boolean }> {
        const response = await api.get<ApiResponse<{ exists: boolean; isVerified: boolean }>>(`/api/guides/status/${userId}`);
        return response.data.data;
    },

    async getAllGuides(params: any): Promise<{ guides: IGuide[], total: number }> {
        const response = await api.get<ApiResponse<{ guides: IGuide[], total: number }>>("/api/guides/all", { params });
        return response.data.data;
    }
};

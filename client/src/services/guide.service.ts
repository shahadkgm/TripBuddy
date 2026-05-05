import api from '../utils/api';
import { API_ENDPOINTS } from '../constants/api.constants';
import type { IGuide, IGuideInvitation } from '../interface/ITripdetails';
import type { ApiResponse } from '../interface/ApiResponse';

export const guideService = {
  async updateProfile(data: FormData | Partial<IGuide>): Promise<IGuide> {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await api.put<ApiResponse<IGuide>>(API_ENDPOINTS.GUIDES.PROFILE, data, { headers });
    const updatedGuide = response.data.data;

    // Sync local storage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      user.guideProfile = { ...user.guideProfile, ...updatedGuide };
      // Also sync avatar if updated
      if (updatedGuide.avatarURL) {
        user.avatarURL = updatedGuide.avatarURL;
      }
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new Event('storage'));
    }

    return updatedGuide;
  },

  async getStatus(userId: string): Promise<{ exists: boolean; isVerified: boolean }> {
    const response = await api.get<ApiResponse<{ exists: boolean; isVerified: boolean }>>(
      API_ENDPOINTS.GUIDES.STATUS(userId)
    );
    return response.data.data;
  },

  async getAllGuides(
    params: Record<string, string | number | boolean>
  ): Promise<{ guides: IGuide[]; total: number }> {
    const response = await api.get<ApiResponse<{ guides: IGuide[]; total: number }>>(
      API_ENDPOINTS.GUIDES.ALL,
      { params }
    );
    return response.data.data;
  },

  async sendInvitation(tripId: string, guideId: string): Promise<ApiResponse<IGuideInvitation>> {
    const response = await api.post<ApiResponse<IGuideInvitation>>(API_ENDPOINTS.GUIDE_INVITATIONS.SEND, {
      tripId,
      guideId,
    });
    return response.data;
  },

  async getInboundInvitations(
    page = 1,
    limit = 5
  ): Promise<{ invitations: IGuideInvitation[]; total: number }> {
    const response = await api.get<ApiResponse<{ invitations: IGuideInvitation[]; total: number }>>(
      API_ENDPOINTS.GUIDE_INVITATIONS.INBOUND,
      {
        params: { page, limit },
      }
    );
    return response.data.data;
  },

  async respondToInvitation(
    invitationId: string,
    status: 'accepted' | 'rejected',
    reason?: string
  ): Promise<ApiResponse<IGuideInvitation>> {
    const response = await api.post<ApiResponse<IGuideInvitation>>(
      API_ENDPOINTS.GUIDE_INVITATIONS.RESPOND,
      {
        invitationId,
        status,
        reason,
      }
    );
    return response.data;
  },
};

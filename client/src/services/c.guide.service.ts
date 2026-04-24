import api from '../utils/api';
import type { IGuide, IGuideInvitation } from '../interface/ITripdetails';
import type { ApiResponse } from '../interface/ApiResponse';

export const guideService = {
  async updateProfile(data: FormData | Partial<IGuide>): Promise<IGuide> {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await api.put<ApiResponse<IGuide>>('/api/guides/profile', data, { headers });
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
      `/api/guides/status/${userId}`
    );
    return response.data.data;
  },

  async getAllGuides(params: Record<string, string | number | boolean>): Promise<{ guides: IGuide[]; total: number }> {
    const response = await api.get<ApiResponse<{ guides: IGuide[]; total: number }>>(
      '/api/guides/all',
      { params }
    );
    return response.data.data;
  },

  async sendInvitation(tripId: string, guideId: string): Promise<ApiResponse<IGuideInvitation>> {
    const response = await api.post<ApiResponse<IGuideInvitation>>('/api/guide-invitations/send', { tripId, guideId });
    return response.data;
  },

  async getInboundInvitations(): Promise<IGuideInvitation[]> {
    const response = await api.get<ApiResponse<IGuideInvitation[]>>('/api/guide-invitations/inbound');
    return response.data.data;
  },

  async respondToInvitation(
    invitationId: string,
    status: 'accepted' | 'rejected',
    reason?: string
  ): Promise<ApiResponse<IGuideInvitation>> {
    const response = await api.post<ApiResponse<IGuideInvitation>>('/api/guide-invitations/respond', {
      invitationId,
      status,
      reason,
    });
    return response.data;
  },
};

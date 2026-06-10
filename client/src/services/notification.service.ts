import api from '../utils/api';

export interface INotification {
  _id: string;
  recipientId: string;
  senderId?: {
    _id: string;
    name: string;
    avatarURL: string;
  };
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  getUserNotifications: async () => {
    const response = await api.get<{ data: INotification[] }>('/api/notifications');
    return response.data.data;
  },

  deleteNotification: async (id: string) => {
    const response = await api.delete(`/api/notifications/${id}`);
    return response.data;
  },

  deleteAllNotifications: async () => {
    const response = await api.delete('/api/notifications/all');
    return response.data;
  },
};

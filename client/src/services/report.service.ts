import api from '../utils/api';
import { API_ENDPOINTS } from '../constants/api.constants';

export interface IReportData {
  targetId: string;
  targetType: 'guide' | 'organizer';
  tripId: string;
  reason: string;
  description: string;
}

export const reportService = {
  async submitReport(data: IReportData) {
    const response = await api.post(API_ENDPOINTS.REPORTS.BASE, data);
    return response.data;
  },

  async getAllReports() {
    const response = await api.get(API_ENDPOINTS.REPORTS.ALL);
    return response.data.data;
  },

  async updateReportStatus(reportId: string, status: string) {
    const response = await api.patch(API_ENDPOINTS.REPORTS.STATUS(reportId), { status });
    return response.data;
  },

  async getReportsByTarget(targetId: string) {
    const response = await api.get(API_ENDPOINTS.REPORTS.TARGET(targetId));
    return response.data.data as IReport[];
  },
};

export interface IReport {
  _id: string;
  reporterId: { _id: string; name: string; email: string; avatarURL?: string };
  tripId: { _id: string; title: string; destination: string };
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

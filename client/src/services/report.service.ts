import api from '../utils/api';

export interface IReportData {
  targetId: string;
  targetType: 'guide' | 'organizer';
  tripId: string;
  reason: string;
  description: string;
}

export const reportService = {
  async submitReport(data: IReportData) {
    const response = await api.post('/api/reports', data);
    return response.data;
  },

  async getAllReports() {
    const response = await api.get('/api/reports/all');
    return response.data.data;
  },

  async updateReportStatus(reportId: string, status: string) {
    const response = await api.patch(`/api/reports/${reportId}/status`, { status });
    return response.data;
  },

  async getReportsByTarget(targetId: string) {
    const response = await api.get(`/api/reports/target/${targetId}`);
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

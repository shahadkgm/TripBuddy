export interface CreateReportDTO {
  targetId: string;
  targetType: 'guide' | 'organizer';
  tripId: string;
  reason: string;
  description: string;
}

export interface UpdateReportStatusDTO {
  status: 'pending' | 'resolved' | 'dismissed';
}

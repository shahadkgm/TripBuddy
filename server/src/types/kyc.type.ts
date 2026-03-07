export type KYCStatus = 'pending' | 'approved' | 'rejected';

export interface IKYC {
  _id: string;
  userId: string;
  documentType: string;
  filePath: string;
  status: KYCStatus;
  rejectionReason?: string | null;
  uploadedAt: Date;
}

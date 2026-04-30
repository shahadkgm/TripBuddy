import { KYCStatus } from '../types/kyc.type';

export interface SaveKYCResponseDTO {
  id: string;
  userId: string;
  documentType: string;
  status: KYCStatus;
  rejectionReason?: string | null;
  uploadedAt: Date;
}

export interface KYCStatusResponseDTO {
  userId: string;
  status: KYCStatus | 'none';
  rejectionReason?: string | null;
}

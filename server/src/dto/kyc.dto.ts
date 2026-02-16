import { KYCStatus } from '../types/kyc.type';

export interface SaveKYCResponseDTO {
  id: string;
  userId: string;
  documentType: string;
  status: KYCStatus;
  uploadedAt: Date;
}

export interface KYCStatusResponseDTO {
  userId: string;
  status: KYCStatus | 'none';
}

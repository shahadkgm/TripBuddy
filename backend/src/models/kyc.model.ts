// models/kyc.model.ts
import { Schema, model } from 'mongoose';

const kycSchema = new Schema({
  userId: { type: String, required: true },
  documentType: { 
    type: String, 
    enum: ['national_id', 'passport', 'driver_license'], 
    required: true 
  },
  filePath: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  uploadedAt: { type: Date, default: Date.now }
});

export const KYC = model('KYC', kycSchema);
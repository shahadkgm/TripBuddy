import mongoose, { Schema } from 'mongoose';
import { IGuide } from '../types/guide.type';

const GuideProfileSchema = new Schema<IGuide>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    bio: { type: String, required: true },
    dailyRate: { type: Number, required: true },
    serviceArea: { type: String, required: true },
    certificateUrl: { type: String },
    yearsOfExperience: { type: Number, default: 0 },
    avatarURL: { type: String },
    specialties: [{ type: String }],
    isVerified: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    rejectionReason: { type: String },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IGuide>('GuideProfile', GuideProfileSchema);

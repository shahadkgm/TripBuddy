// backend/src/models/guide.model.ts
import mongoose, { Schema } from 'mongoose';
import { IGuideProfile } from '../controllers/interfaces/IGuideController.js';

const GuideProfileSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bio: { type: String, required: true },
  hourlyRate: { type: Number, required: true },
  serviceArea: { type: String, required: true },
  certificateUrl: { type: String, required: false }, 
  yearsOfExperience: { type: Number, default: 0 }, 
  avatarURL: { type: String },
  specialities: [{ type: String }],
  isVerified: { type: Boolean, default: false }, 
  lastUpdated: { type: Date, default: Date.now } 
}, { timestamps: true });

export default mongoose.model<IGuideProfile>('GuideProfile', GuideProfileSchema);
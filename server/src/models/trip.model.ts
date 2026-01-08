import mongoose, { Schema, Document } from 'mongoose';

export interface ITrip extends Document {
  title: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  description: string;
  budget: number;
  tripImage?: string;
  userId: mongoose.Types.ObjectId;
  tripMember: mongoose.Types.ObjectId[];
  guidId?: mongoose.Types.ObjectId;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
}

const TripSchema: Schema = new Schema({
  title: { type: String, required: true },
  destination: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  description: { type: String },
  budget: { type: Number, required: true },
  tripImage: { type: String }, 
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  // ADD THIS BLOCK TO MATCH YOUR FRONTEND DATA
  preferences: {
    travelers: { type: Number },
    accommodation: { type: String },
    transport: { type: String },
    interests: [{ type: String }]
  },
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model<ITrip>('Trip', TripSchema);
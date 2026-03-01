import mongoose, { Document, Schema } from 'mongoose';

export interface IGalleryPost extends Document {
    user: mongoose.Types.ObjectId;
    image: string;
    caption: string;
    tripName?: string;
    createdAt: Date;
    updatedAt: Date;
}

const GalleryPostSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: String, required: true },
    caption: { type: String, default: '' },
    tripName: { type: String, default: '' },
}, {
    timestamps: true
});

export default mongoose.model<IGalleryPost>('GalleryPost', GalleryPostSchema);

import { Schema, model, Document, Types } from 'mongoose';

export interface IMessage {
    tripId: Types.ObjectId;
    senderId: Types.ObjectId;
    content: string;
    messageType?: 'text' | 'image';
    fileUrl?: string;
    timestamp: Date;
}

export type IMessageDocument = IMessage & Document;

export interface IMessagePopulated extends Omit<IMessage, 'senderId'> {
    _id: string | Types.ObjectId;
    senderId: {
        _id: string | Types.ObjectId;
        name: string;
        avatarURL?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new Schema<IMessageDocument>(
    {
        tripId: {
            type: Schema.Types.ObjectId,
            ref: 'Trip',
            required: true,
        },
        senderId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        messageType: {
            type: String,
            enum: ['text', 'image'],
            default: 'text',
        },
        fileUrl: {
            type: String,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Index for fast retrieval of messages for a specific trip
messageSchema.index({ tripId: 1, createdAt: 1 });

export const MessageModel = model<IMessageDocument>('Message', messageSchema);

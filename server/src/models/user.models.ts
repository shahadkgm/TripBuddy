// backend/src/models/user.model.ts
import { Schema, model } from 'mongoose';
import { IUserDocument } from '../types/user.type.js';

const userSchema = new Schema<IUserDocument>({
    name: {
        type: String,
        required: true,
        trim: true, 
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: false, 
        minlength: 6,
    },
    // --- ADD THIS FIELD FOR BLOCKING ---
    isBlocked: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ["user", "guide", "admin"], // If your frontend uses 'explorer', change 'user' to 'explorer'
        default: "user"
    },
    passwordResetToken: { type: String, default: undefined },
    passwordResetExpires: { type: Date, default: undefined },
}, {
    timestamps: true,
});

const UserModel = model<IUserDocument>('User', userSchema);

export default UserModel;
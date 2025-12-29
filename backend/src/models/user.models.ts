// backend/src/models/user.model.ts
import { Schema, model } from 'mongoose';
import { IUserDocument } from '../types/User.js';

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
        required: true,
        minlength: 6,
    },
    // --- ADD THESE FIELDS ---
    passwordResetToken: {
        type: String,
        default: undefined
    },
    passwordResetExpires: {
        type: Date,
        default: undefined
    },
}, {
    timestamps: true,
});

const UserModel = model<IUserDocument>('User', userSchema);

export default UserModel;
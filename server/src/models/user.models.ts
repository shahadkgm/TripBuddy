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
    isBlocked: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'admin'], 
        default: 'user'
    },
    verificationToken: String,
verificationTokenExpires: Date,
isVerified: {
  type: Boolean,
  default: false,
},
    passwordResetToken: { type: String, default: undefined },
    passwordResetExpires: { type: Date, default: undefined },
}, {
    timestamps: true,
});

const UserModel = model<IUserDocument>('User', userSchema);

export default UserModel;
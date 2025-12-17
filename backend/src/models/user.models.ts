import { Schema, model } from 'mongoose';
import { IUserDocument } from '../types/User.js';

const userSchema = new Schema<IUserDocument>({
    name: {
        type: String,
        required: true,
        trim: true, // removes extra spaces
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
        minlength: 6, // ensures strong password
    },
}, {
    timestamps: true,
});

const UserModel = model<IUserDocument>('User', userSchema);

export default UserModel;

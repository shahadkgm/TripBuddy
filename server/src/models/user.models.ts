// // backend/src/models/user.model.ts
// import { Schema, model } from 'mongoose';
// import { IUserDocument } from '../types/user.type';

// const userSchema = new Schema<IUserDocument>({
//     name: {
//         type: String,
//         required: true,
//         trim: true, 
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//         lowercase: true,
//         trim: true,
//     },
//     password: {
//         type: String,
//         required: false, 
//         minlength: 6,
//     },
//     isBlocked: {
//         type: Boolean,
//         default: false
//     },
//     role: {
//         type: String,
//         enum: ['user', 'guide', 'admin'], 
//         default: 'user'
//     },
//     verificationToken: String,
// verificationTokenExpires: Date,
// isVerified: {
//   type: Boolean,
//   default: false,
// },
//     passwordResetToken: { type: String, default: undefined },
//     passwordResetExpires: { type: Date, default: undefined },
// }, {
//     timestamps: true,
// });

// const UserModel = model<IUserDocument>('User', userSchema);

// export default UserModel;
import { Schema, model, HydratedDocument } from 'mongoose';


export type IUserDoc = HydratedDocument<IUser>;

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 6 },

    isBlocked: { type: Boolean, default: false },

    role: {
      type: String,
      enum: ['user', 'guide', 'admin'],
      default: 'user',
    },

    verificationToken: String,
    verificationTokenExpires: Date,

    isVerified: { type: Boolean, default: false },
    walletBalance: { type: Number, default: 0 },
    avatarURL: { type: String },
    bio: { type: String },
    hourlyRate: { type: Number },
    serviceArea: { type: String },
    yearsOfExperience: { type: Number },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userSchema.virtual('guideProfile', {
  ref: 'GuideProfile',
  localField: '_id',
  foreignField: 'userId',
  justOne: true
});

import { IUser } from '../types/user.type';

export const UserModel = model<IUser>('User', userSchema);


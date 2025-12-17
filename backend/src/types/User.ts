import { Document } from 'mongoose';

// Interface for User properties
export interface IUser {
    name: string;
    email: string;
    password: string; 
}

// Interface for the Mongoose Document
export interface IUserDocument extends IUser, Document {}

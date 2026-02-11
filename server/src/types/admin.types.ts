// backend/src/types/Admin.ts

import { IUser } from './user.type.js';

export interface IUserListResponse {
  users: IUser[];
  totalUsers: number;
  totalPages: number;
}
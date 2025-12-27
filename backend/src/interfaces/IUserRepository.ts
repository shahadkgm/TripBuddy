// src/interfaces/IUserRepository.ts
import { IUser } from '../types/User.js';

export interface IUserRepository {
  create(userData: IUser): Promise<any>;
  findByEmail(email: string): Promise<any>;
  findAll(): Promise<any[]>;
}
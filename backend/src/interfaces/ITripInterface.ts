// src/interfaces/ITripRepository.ts
import { ITrip } from '../models/trip.model.js';

export interface ITripRepository {
    findAll(filters: any): Promise<ITrip[]>;

// findAll(filters: any, skip: number, limit: number): Promise<{ trips: ITrip[], total: number }>;  create(tripData: any): Promise<ITrip>;
}

// src/interfaces/ITripService.ts
export interface ITripService {
  // CHANGE: Accept an object with optional filters instead of just a string
  getAvailableTrips(filters: {
    destination?: string;
    transport?: string;
    interest?: string;
  }): Promise<any[]>;
  
  createNewTrip(data: any): Promise<any>;
}  
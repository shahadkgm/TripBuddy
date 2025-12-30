// src/interfaces/ITripRepository.ts
import { ITrip } from '../models/trip.model.js';

export interface ITripRepository {
  findAll(
    filters: any, 
    skip: number, 
    limit: number
  ): Promise<{ trips: ITrip[], total: number }>; // Use 'total' here
  
  create(tripData: any): Promise<ITrip>;
}

// src/interfaces/ITripService.ts
export interface ITripService {
  getAvailableTrips(filters: {
    destination?: string;
    transport?: string;
    interest?: string;
    page?: number;  
    limit?: number;  
  }): Promise<{ trips: any[], total: number }>; 

  createNewTrip(userId: string, data: any, filePath?: string): Promise<any>;
} 
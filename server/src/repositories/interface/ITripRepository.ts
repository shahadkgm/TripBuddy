// src/interfaces/ITripRepository.ts

import { ITrip } from '../../models/trip.model.js';

export interface ITripRepository {
  findAll(
    filters: any, 
    skip: number, 
    limit: number
  ): Promise<{ trips: ITrip[], total: number }>; // Use 'total' here
  
  create(tripData: any): Promise<ITrip>;
}

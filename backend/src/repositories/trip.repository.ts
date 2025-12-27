// src/repositories/trip.repository.ts
import TripModel, { ITrip } from '../models/trip.model.js';
import { ITripRepository } from '../interfaces/ITripInterface.js';

export class TripRepository implements ITripRepository{
  async findAll(filters: any): Promise<ITrip[]> {
    // We populate 'userId' to get name/email for the Traveler Card
    return await TripModel.find(filters)
      .populate('userId', 'name email') 
      .sort({ createdAt: -1 })
      .exec();
  }

  async create(tripData: any): Promise<ITrip> {
    return await TripModel.create(tripData);
  }
}
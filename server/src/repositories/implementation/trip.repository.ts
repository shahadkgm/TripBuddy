// src/repositories/trip.repository.ts
import { ITripRepository } from "../interface/ITripRepository.js";
import tripModel, { ITrip } from "../../models/trip.model.js";

export class TripRepository implements ITripRepository {
  
  async findAll(filters: any, skip: number = 0, limit: number = 6): Promise<{ trips: ITrip[], total: number }> {
    const [trips, totalCount] = await Promise.all([
      tripModel.find(filters)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      tripModel.countDocuments(filters)
    ]);

    return {
      trips,
      total: totalCount 
    };
  }

  
  async create(tripData: Partial<ITrip>): Promise<ITrip> {
    
    return await tripModel.create(tripData);
  }
}
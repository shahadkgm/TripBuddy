// // src/repositories/trip.repository.ts
// import TripModel, { ITrip } from '../models/trip.model.js';
// import { ITripRepository } from '../interfaces/ITripInterface.js';

import { ITripRepository } from "../interfaces/ITripInterface.js";
import tripModel, { ITrip } from "../models/trip.model.js";

// export class TripRepository implements ITripRepository{
//   async findAll(filters: any): Promise<ITrip[]> {
//     // We populate 'userId' to get name/email for the Traveler Card
//     return await TripModel.find(filters)
//       .populate('userId', 'name email') 
//       .sort({ createdAt: -1 })
//       .exec();
//   }

//   async create(tripData: any): Promise<ITrip> {
//     return await TripModel.create(tripData);
//   }
// }

// src/repositories/trip.repository.ts
// src/repositories/trip.repository.ts

export class TripRepository implements ITripRepository {
  async findAll(filters: any, skip: number = 0, limit: number = 6): Promise<{ trips: ITrip[], total: number }> {
    
    // 1. You named this 'totalCount'
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
      total: totalCount // CHANGE: Map totalCount to total
    };
  }

  async create(tripData: any): Promise<ITrip> {
    return await tripModel.create(tripData);
  }
}
// src/services/trip.service.ts
import { ITripRepository } from '../interfaces/ITripInterface.js';
import { ITripService } from '../interfaces/ITripInterface.js';

export class TripService implements ITripService {
  constructor(private tripRepository: ITripRepository) {}

  async getAvailableTrips(filters: any) {
    const query: any = { status: 'active' };

    // 1. Destination (Partial Search)
    if (filters.destination && filters.destination.trim() !== "") {
      query.destination = { $regex: filters.destination, $options: 'i' };
    }

    // 2. Transport (Ignore if "Any")
    if (filters.transport && filters.transport !== 'Any') {
      query['preferences.transport'] = filters.transport;
    }

    // 3. Interests (Ignore if "Any")
    if (filters.interest && filters.interest !== 'Any') {
      // MongoDB "$in" operator finds if the string exists in the interests array
      query['preferences.interests'] = { $in: [filters.interest] };
    }

    return await this.tripRepository.findAll(query);
  }

  async createNewTrip(data: any) {
    return await this.tripRepository.create(data);
  }
}
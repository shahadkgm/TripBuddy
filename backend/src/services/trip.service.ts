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
      query['preferences.interests'] = { $in: [filters.interest] };
    }
    
    // --- PAGINATION LOGIC START ---
    // Extract page and limit, providing defaults just in case
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 6;
    
    
    const skip = (page - 1) * limit;
    // --- PAGINATION LOGIC END ---
    console.log("from backend /trip.service.ts",page)

    return await this.tripRepository.findAll(query, skip, limit);
  }

  async createNewTrip(data: any) {
    return await this.tripRepository.create(data);
  }
}
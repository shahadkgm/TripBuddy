// src/services/trip.service.ts
import { ITripRepository } from '../interfaces/ITripInterface.js';
import { ITripService } from '../interfaces/ITripInterface.js';

export class TripService implements ITripService {
  constructor(private tripRepository: ITripRepository) {}

  async getAvailableTrips(filters: any) {
    const query: any = { status: 'active' };
    if (filters.destination && filters.destination.trim() !== "") {
      query.destination = { $regex: filters.destination, $options: 'i' };
    }
    
    if (filters.transport && filters.transport !== 'Any') {
      query['preferences.transport'] = filters.transport;
    }
    
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

  async createNewTrip(userId: string, data: any, filePath?: string) {
    const tripData = {
      title: data.title,
      destination: data.destination,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      description: data.description,
      budget: Number(data.budget),
      userId: userId,
      tripImage: filePath || null, 
      tripMember: [userId], 
      status: 'upcoming' 
    };

    return await this.tripRepository.create(tripData);
  }
}
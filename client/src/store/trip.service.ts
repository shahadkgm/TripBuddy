// src/modules/auth/services/trip.service.ts
import axios from 'axios';
import type { ITrip } from '../interface/ITripdetails';
import type { PaginationProps } from '../interface/IPaginatedTrips';

const API_URL = import.meta.env.VITE_API_URL;

class TripService {
 
  async getAllTrips(filters?: any): Promise<PaginationProps> {
    const response = await axios.get(`${API_URL}/api/trips`, { params: filters });
    return response.data;
  }

  async createNewTrip(data: any): Promise<ITrip> {
    const response = await axios.post(`${API_URL}/api/trips`, data);
    return response.data;
  }
}

export const tripService = new TripService();
// src/modules/auth/services/trip.service.ts
import axios from 'axios';
import type { ITrip } from '../interface/ITripdetails';
// import { ITrip } from '../interface/ITripdetails';

const API_URL = import.meta.env.VITE_API_URL;

class TripService {
  async getAllTrips(filters?: any): Promise<ITrip[]> {
    // We pass filters as query params: e.g., ?destination=Goa
    const response = await axios.get(`${API_URL}/api/trips`, { params: filters });
    return response.data;
  }
}

export const tripService = new TripService();
// src/services/travelerService.ts
import { Traveler } from "../types/Traveler.js";

export class TravelerService {
  async getTravelers(filters?: any): Promise<Traveler[]> {
    // In a real app: return fetch('/api/travelers').then(res => res.json());
    // For now, returning mock data based on your HTML
    return [
      {
        id: "1",
        name: "Aarav Sharma",
        age: 26,
        type: "Solo Traveler",
        destination: "Goa",
        travelMode: "Flight",
        interests: ["Beaches", "Nightlife"],
        imageUrl: "https://i.pravatar.cc/100?img=12",
      },
      // ... add more mock travelers here
    ];
  }
}
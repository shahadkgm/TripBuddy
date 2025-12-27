// src/types/Traveler.ts
export interface Traveler {
  id: string;
  name: string;
  age: number;
  type: string; // e.g., "Solo Traveler"
  destination: string;
  travelMode: string;
  interests: string[];
  imageUrl: string;
}
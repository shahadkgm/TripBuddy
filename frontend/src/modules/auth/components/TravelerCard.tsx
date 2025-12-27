// src/modules/trips/components/TravelerCard.tsx
import React from 'react';
import { MapPin, Calendar, DollarSign } from 'lucide-react';
import type { ITrip } from '../interface/ITripdetails';

interface Props {
  trip: ITrip;
}

export const TravelerCard: React.FC<Props> = ({ trip }) => {
  return (
    <div className="p-6 border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition bg-white">
      <div className="flex items-center space-x-4 mb-4">
        <img 
          src={trip.userId.avatar || `https://i.pravatar.cc/150?u=${trip.userId._id}`} 
          className="w-14 h-14 rounded-full border-2 border-indigo-500" 
          alt={trip.userId.name}
        />
        <div>
          <h3 className="text-lg font-bold text-slate-800">{trip.userId.name}</h3>
          <p className="text-gray-500 text-sm">Planning: {trip.title}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <p className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-500" /> <strong>{trip.destination}</strong>
        </p>
        <p className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-500" /> 
          {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
        </p>
        <p className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-indigo-500" /> Budget: ${trip.budget}
        </p>
      </div>

      <button className="mt-5 w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
        View Trip & Connect
      </button>
    </div>
  );
};
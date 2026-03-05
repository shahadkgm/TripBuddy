import React, { useState, useEffect } from 'react';
import {
  MapPin, Calendar, IndianRupee, UserCheck,
  ChevronRight
} from 'lucide-react';
import type { ITrip } from '../interface/ITripdetails';
import { connectionService } from '../services/c.connection.service';
import { authService } from '../services/c.authService';
import { useNavigate } from 'react-router-dom';

interface Props {
  trip: ITrip;
}

export const TravelerCard: React.FC<Props> = ({ trip }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'none' | 'pending' | 'accepted' | 'incoming_pending' | 'loading'>('loading');
  const currentUser = authService.getCurrentUser();
  const isOwnTrip = currentUser?.id === trip.userId?._id;

  useEffect(() => {
    if (!currentUser?.id || isOwnTrip) {
      setStatus('none');
      return;
    }

    const fetchStatus = async () => {
      try {
        const resStatus = await connectionService.getStatus(trip.userId._id, trip._id);
        setStatus(resStatus);
      } catch (error) {
        console.error("Error fetching connection status:", error);
        setStatus('none');
      }
    };

    fetchStatus();
  }, [trip.userId?._id, trip._id, currentUser?.id, isOwnTrip]);

  return (
    <div
      onClick={() => navigate(`/trip-details/${trip._id}`, { state: { from: '/find-travelers' } })}
      className="p-6 border border-gray-100 rounded-3xl shadow-sm transition-all duration-300 bg-white group relative hover:shadow-xl hover:-translate-y-1 cursor-pointer"
    >
      <div className="flex items-center space-x-4 mb-6 group/header">
        <div className="relative">
          <img
            src={trip.userId?.avatarURL || `https://i.pravatar.cc/150?u=${trip.userId?._id || 'unknown'}`}
            className="w-16 h-16 rounded-2xl border-2 border-indigo-50 object-cover shadow-sm group-hover/header:border-indigo-500 transition-all duration-300"
            alt={trip.userId?.name || 'Unknown Traveler'}
          />
          {status === 'accepted' && (
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-sm">
              <UserCheck className="w-3 h-3" />
            </div>
          )}
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800 leading-tight group-hover/header:text-indigo-600 transition-colors uppercase tracking-tight">
            {trip.destination}
          </h3>
          <p className="text-slate-500 text-sm font-medium mt-0.5">
            by {trip.userId?.name || 'Unknown Traveler'}
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-6 bg-slate-50/50 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <MapPin className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-slate-700 font-semibold truncate">{trip.destination}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-slate-600 text-sm font-medium">
            {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <IndianRupee className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-slate-600 text-sm font-bold">Budget: ₹{trip.budget}</span>
        </div>
      </div>

      <button
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 group-hover:bg-indigo-700"
      >
        See More
        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
};
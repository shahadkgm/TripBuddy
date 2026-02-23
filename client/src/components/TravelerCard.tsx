import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, DollarSign, UserCheck, UserPlus, Clock } from 'lucide-react';
import type { ITrip } from '../interface/ITripdetails';
import { connectionService } from '../services/connection.service';
import { authService } from '../services/c.authService';
import toast from 'react-hot-toast';

interface Props {
  trip: ITrip;
}

export const TravelerCard: React.FC<Props> = ({ trip }) => {
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

  const handleConnect = async () => {
    if (!currentUser?.id) {
      toast.error("Please login to connect");
      return;
    }

    try {
      setStatus('loading');
      await connectionService.sendRequest(trip.userId._id, trip._id);
      setStatus('pending');
      toast.success("Connection request sent!");
    } catch (error) {
      toast.error("Failed to send request");
      setStatus('none');
    }
  };

  const renderConnectButton = () => {
    if (isOwnTrip) return (
      <button className="mt-5 w-full bg-slate-100 text-slate-400 py-3 rounded-xl font-bold cursor-not-allowed">
        Your Trip
      </button>
    );

    switch (status) {
      case 'loading':
        return (
          <button disabled className="mt-5 w-full bg-gray-50 text-gray-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
            Checking...
          </button>
        );
      case 'accepted':
        return (
          <button className="mt-5 w-full bg-emerald-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-100">
            <UserCheck className="w-5 h-5" />
            Connected
          </button>
        );
      case 'pending':
        return (
          <button disabled className="mt-5 w-full bg-amber-50 text-amber-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-amber-200">
            <Clock className="w-5 h-5" />
            Request Sent
          </button>
        );
      case 'incoming_pending':
        return (
          <button className="mt-5 w-full bg-indigo-100 text-indigo-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-indigo-200">
            <UserPlus className="w-5 h-5" />
            Go to Requests
          </button>
        );
      default:
        return (
          <button
            onClick={handleConnect}
            className="mt-5 w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
          >
            <UserPlus className="w-5 h-5" />
            Connect to Travel
          </button>
        );
    }
  };

  return (
    <div className="p-6 border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 bg-white group">
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative">
          <img
            src={trip.userId?.avatarURL || `https://i.pravatar.cc/150?u=${trip.userId?._id || 'unknown'}`}
            className="w-16 h-16 rounded-2xl border-2 border-indigo-50 object-cover shadow-sm group-hover:border-indigo-500 transition-colors"
            alt={trip.userId?.name || 'Unknown Traveler'}
          />
          {status === 'accepted' && (
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white">
              <UserCheck className="w-3 h-3" />
            </div>
          )}
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800 leading-tight">{trip.userId?.name || 'Unknown Traveler'}</h3>
          <p className="text-slate-400 text-sm font-medium mt-0.5">Planning: {trip.title}</p>
        </div>
      </div>

      <div className="space-y-3 mb-6 bg-slate-50/50 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <MapPin className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-slate-700 font-semibold">{trip.destination}</span>
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
            <DollarSign className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-slate-600 text-sm font-bold">Budget: ${trip.budget}</span>
        </div>
      </div>

      {renderConnectButton()}
    </div>
  );
};
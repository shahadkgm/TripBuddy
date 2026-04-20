import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  IndianRupee,
  UserCheck,
  ChevronRight,
  Clock,
  Edit3,
  AlertCircle,
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
  const [status, setStatus] = useState<
    'none' | 'pending' | 'accepted' | 'incoming_pending' | 'loading'
  >('loading');
  const currentUser = authService.getCurrentUser();
  const isOwnTrip = currentUser?.id === trip.userId?._id;

  const isExpired =
    new Date(trip.startDate).getTime() - 8 * 60 * 60 * 1000 < new Date().getTime() ||
    trip.status === 'completed' ||
    trip.status === 'cancelled';

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
        console.error('Error fetching connection status:', error);
        setStatus('none');
      }
    };

    fetchStatus();
  }, [trip.userId?._id, trip._id, currentUser?.id, isOwnTrip]);

  return (
    <div
      onClick={() => navigate(`/trip-details/${trip._id}`, { state: { from: '/find-travelers' } })}
      className={`p-6 border rounded-3xl transition-all duration-300 bg-white group relative hover:shadow-xl hover:-translate-y-1 cursor-pointer 
        ${isExpired ? 'border-amber-100 shadow-sm opacity-90' : 'border-gray-100 shadow-sm'}`}
    >
      {/* Expired Badge */}
      {isExpired && (
        <div className="absolute -top-3 left-6 px-4 py-1.5 bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg flex items-center gap-1.5 z-10">
          <Clock size={12} />
          Expired
        </div>
      )}

      <div className="flex items-center space-x-4 mb-6 group/header">
        <div className="relative">
          <img
            src={
              trip.userId?.avatarURL ||
              `https://i.pravatar.cc/150?u=${trip.userId?._id || 'unknown'}`
            }
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
          <h3 className="text-xl font-black text-slate-900 leading-tight group-hover/header:text-indigo-600 transition-colors uppercase tracking-tighter">
            {trip.title || trip.destination}
          </h3>
          <p className="text-slate-500 text-sm font-bold mt-0.5">
            organized by{' '}
            <span className="text-indigo-600">{trip.userId?.name || 'Unknown Traveler'}</span>
          </p>
        </div>
      </div>

      <div
        className={`space-y-3 mb-6 p-4 rounded-2xl ${isExpired ? 'bg-amber-50/50' : 'bg-slate-50/50'}`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <MapPin className={`w-4 h-4 ${isExpired ? 'text-amber-500' : 'text-indigo-500'}`} />
          </div>
          <span className="text-slate-700 font-semibold truncate">{trip.destination}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Calendar className={`w-4 h-4 ${isExpired ? 'text-amber-500' : 'text-indigo-500'}`} />
          </div>
          <div className="flex flex-col">
            <span
              className={`${isExpired ? 'text-amber-700' : 'text-slate-600'} text-sm font-medium`}
            >
              {new Date(trip.startDate).toLocaleDateString()} -{' '}
              {new Date(trip.endDate).toLocaleDateString()}
            </span>
            {isExpired && (
              <span className="text-amber-500 text-[9px] font-black uppercase flex items-center gap-1 mt-0.5">
                <AlertCircle size={10} /> Date passed
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <IndianRupee
              className={`w-4 h-4 ${isExpired ? 'text-amber-500' : 'text-indigo-500'}`}
            />
          </div>
          <span className="text-slate-600 text-sm font-extrabold group-hover:text-slate-900 transition-colors">
            Budget: ₹{trip.budget}
          </span>
        </div>
      </div>

      {isOwnTrip && isExpired ? (
        <button
          onClick={e => {
            e.stopPropagation();
            navigate(`/edit-trip/${trip._id}`);
          }}
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200"
        >
          <Edit3 className="w-4 h-4" />
          Re-edit Dates
        </button>
      ) : (
        <button
          className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-lg 
            ${
              isExpired
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 mb-2'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
            }`}
        >
          {isExpired ? 'Expired' : 'See More'}
          {!isExpired && (
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          )}
        </button>
      )}
    </div>
  );
};

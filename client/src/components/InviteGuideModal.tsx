import React, { useEffect, useState } from 'react';
import { X, Calendar, MapPin, Loader2, Sparkles, Send } from 'lucide-react';
import { tripService } from '../services/c.trip.service';
import { guideService } from '../services/c.guide.service';
import { authService } from '../services/c.authService';
import type { ITrip, IGuide } from '../interface/ITripdetails';
import { TripStatus } from '../constants/TripStatus';
import toast from 'react-hot-toast';

interface InviteGuideModalProps {
  guide: IGuide;
  onClose: () => void;
}

export const InviteGuideModal: React.FC<InviteGuideModalProps> = ({ guide, onClose }) => {
  const [trips, setTrips] = useState<ITrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const user = authService.getCurrentUser();

  useEffect(() => {
    const fetchTrips = async () => {
      if (!user?._id) return;
      try {
        const data = await tripService.getUserTrips(user._id);
        // Only show trips that are in 'planned' or 'finalized' status and don't have this guide assigned
        const eligibleTrips = data.trips.filter(
          trip =>
            (trip.status === TripStatus.PLANNED ||
              trip.status === TripStatus.FINALIZED ||
              trip.status === TripStatus.CONFIRMED) &&
            trip.guideId?._id !== guide._id
        );
        setTrips(eligibleTrips);
      } catch (_err) {
        console.error('Error fetching trips:', _err);
        toast.error('Failed to load your trips');
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [user?._id, guide._id]);

  const handleInvite = async () => {
    if (!selectedTripId) {
      toast.error('Please select a trip');
      return;
    }

    setSending(true);
    try {
      await guideService.sendInvitation(selectedTripId, guide._id || guide.id || '');
      toast.success(`Invitation sent to ${guide.name || guide.userId?.name}!`);
      onClose();
    } catch (_err: unknown) {
      const errorObj = _err as { response?: { data?: { message?: string } } };
      const msg = errorObj.response?.data?.message || 'An unexpected error occurred.';
      const message = msg || 'Failed to send invitation';
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="relative z-10 flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Sparkles size={32} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight uppercase">Invite Guide</h3>
              <p className="text-indigo-100 font-bold uppercase tracking-widest text-[10px] mt-1">
                Collaborate with {guide.name || guide.userId?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">
            Select Trip
          </label>

          {loading ? (
            <div className="py-12 flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                Finding your adventures...
              </p>
            </div>
          ) : trips.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {trips.map(trip => (
                <div
                  key={trip._id}
                  onClick={() => setSelectedTripId(trip._id)}
                  className={`group p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between
                    ${
                      selectedTripId === trip._id
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-100'
                        : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                      ${selectedTripId === trip._id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}
                    >
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h4
                        className={`text-sm font-black uppercase tracking-tight transition-colors
                        ${selectedTripId === trip._id ? 'text-indigo-900' : 'text-slate-700'}`}
                      >
                        {trip.title}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <MapPin size={10} />
                        {trip.destination}
                      </div>
                    </div>
                  </div>
                  {selectedTripId === trip._id && (
                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white animate-in zoom-in duration-300 shadow-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                No eligible trips found
              </p>
              <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-2">
                Create a new trip to invite guides
              </p>
            </div>
          )}

          <div className="mt-10 flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 px-6 rounded-2xl border-2 border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleInvite}
              disabled={sending || !selectedTripId || trips.length === 0}
              className="flex-[2] py-4 px-6 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-200/50 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none transition-all"
            >
              {sending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Send Invitation <Send size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

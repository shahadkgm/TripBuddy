import React, { useState, useEffect } from 'react';
import {
  MapPin, Calendar, DollarSign, UserCheck,
  UserPlus, Clock,
  X, Shield, Info, Camera
} from 'lucide-react';
import type { ITrip } from '../interface/ITripdetails';
import { connectionService } from '../services/connection.service';
import { authService } from '../services/c.authService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import type { GalleryPost } from '../services/gallery.service';
import { galleryService } from '../services/gallery.service';

interface Props {
  trip: ITrip;
}

export const TravelerCard: React.FC<Props> = ({ trip }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'none' | 'pending' | 'accepted' | 'incoming_pending' | 'loading'>('loading');
  const [galleryPreview, setGalleryPreview] = useState<GalleryPost[]>([]);
  const [isShowcaseOpen, setIsShowcaseOpen] = useState(false);
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

        if (resStatus === 'accepted') {
          const res = await galleryService.getUserPosts(trip.userId._id);
          setGalleryPreview(res.data.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching connection status:", error);
        setStatus('none');
      }
    };

    fetchStatus();
  }, [trip.userId?._id, trip._id, currentUser?.id, isOwnTrip]);

  useEffect(() => {
    if (isShowcaseOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isShowcaseOpen]);

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
          <div className="mt-5 space-y-3">
            <button className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 cursor-default">
              <UserCheck className="w-5 h-5" />
              Connected
            </button>
            {/* <button
              onClick={() => navigate(`/gallery/${trip.userId._id}`)}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              <ImageIcon className="w-5 h-5" />
              View Gallery
            </button> */}
          </div>
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
    <div className={`p-6 border border-gray-100 rounded-3xl shadow-sm transition-all duration-300 bg-white group relative 
      ${isShowcaseOpen ? 'z-50 shadow-none ring-0' : 'hover:shadow-xl hover:-translate-y-1 z-auto'}`}
    >
      {/* Header - Now opens Showcase Modal */}
      <div className={`flex items-center space-x-4 mb-6 cursor-pointer group/header ${isShowcaseOpen ? 'pointer-events-none' : ''}`} onClick={() => setIsShowcaseOpen(true)}>
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
          <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover/header:opacity-100 rounded-2xl transition-opacity flex items-center justify-center">
            <Info className="text-white w-6 h-6" />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800 leading-tight group-hover/header:text-indigo-600 transition-colors">
            {trip.userId?.name || 'Unknown Traveler'}
          </h3>
          <p className="text-slate-400 text-sm font-medium mt-0.5 flex items-center gap-1">
            View Traveler Profile <Info size={12} />
          </p>
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

      {/* TRAVELER SHOWCASE MODAL */}
      {isShowcaseOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 italic-none">
          {/* Backdrop with solid color + blur to prevent see-through */}
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsShowcaseOpen(false)} />

          <div className="relative bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            {/* Modal Header/Cover */}
            <div className="h-40 bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-500 relative shrink-0">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full -ml-12 -mb-12 blur-xl" />

              <button
                onClick={() => setIsShowcaseOpen(false)}
                className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-all z-20 hover:rotate-90"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Area - Scrollable */}
            <div className="px-8 pb-10 -mt-16 relative overflow-y-auto custom-scrollbar">
              <div className="flex flex-col items-center text-center">
                <div className="relative z-10">
                  <img
                    src={trip.userId?.avatarURL || `https://i.pravatar.cc/150?u=${trip.userId?._id}`}
                    className="w-36 h-36 rounded-[2.5rem] border-[6px] border-white object-cover shadow-2xl bg-white"
                    alt={trip.userId?.name}
                  />
                  {status === 'accepted' && (
                    <div className="absolute bottom-2 right-2 bg-emerald-500 text-white p-2.5 rounded-full border-4 border-white shadow-lg">
                      <UserCheck className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <h2 className="mt-6 text-3xl font-black text-slate-800 tracking-tight">{trip.userId?.name}</h2>
                <div className="flex items-center gap-2 mt-1.5 px-4 py-1 bg-indigo-50 rounded-full border border-indigo-100/50">
                  <Shield size={12} className="text-indigo-500 fill-indigo-500/10" />
                  <span className="text-indigo-600 font-black text-[10px] uppercase tracking-widest">{trip.userId?.role} Traveler</span>
                </div>

                {trip.userId?.bio && (
                  <p className="mt-6 text-slate-500 leading-relaxed font-medium italic px-6 text-base">
                    "{trip.userId.bio}"
                  </p>
                )}

                {/* Trip details box inside modal */}
                <div className="mt-8 w-full bg-slate-50/80 rounded-[2rem] p-6 border border-slate-100 flex flex-col gap-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center mb-1">Trip Details</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-2xl shadow-sm flex items-center gap-3">
                      <MapPin size={16} className="text-indigo-500" />
                      <div className="text-left">
                        <span className="block text-[8px] text-slate-400 font-black uppercase">To</span>
                        <span className="text-sm font-bold text-slate-800 truncate">{trip.destination}</span>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-2xl shadow-sm flex items-center gap-3">
                      <DollarSign size={16} className="text-emerald-500" />
                      <div className="text-left">
                        <span className="block text-[8px] text-slate-400 font-black uppercase">Budget</span>
                        <span className="text-sm font-bold text-slate-800">${trip.budget}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-2 mt-6">
                  {trip.preferences.interests.map((interest, idx) => (
                    <span key={idx} className="px-4 py-1.5 bg-white text-slate-600 text-[11px] font-bold uppercase tracking-wider rounded-xl border border-slate-100 shadow-sm">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Gallery Section */}
              <div className="mt-10 pt-8 border-t border-slate-100 bg-white">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Camera className="text-indigo-500 w-5 h-5" /> Memory Showcase
                  </h3>
                  {status === 'accepted' && (
                    <button
                      onClick={() => navigate(`/gallery/${trip.userId?._id}`)}
                      className="text-indigo-600 text-sm font-bold hover:underline"
                    >
                      View Full
                    </button>
                  )}
                </div>

                {status === 'accepted' ? (
                  galleryPreview.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {galleryPreview.map((post: GalleryPost) => (
                        <div
                          key={post._id}
                          className="aspect-square rounded-[1.5rem] overflow-hidden shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-slate-50"
                          onClick={() => navigate(`/gallery/${trip.userId?._id}`)}
                        >
                          <img src={post.image} className="w-full h-full object-cover" alt="Memory" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-50 py-10 rounded-[2rem] text-center border-2 border-dashed border-slate-100">
                      <p className="text-slate-400 text-sm font-medium">No photos shared yet.</p>
                    </div>
                  )
                ) : (
                  <div className="bg-slate-900 rounded-[2.5rem] p-8 text-center relative overflow-hidden group/lock shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent opacity-0 group-hover/lock:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-md ring-1 ring-white/20">
                        <Shield className="text-white w-7 h-7" />
                      </div>
                      <h4 className="text-white font-bold text-lg mb-2">Connect to Unlock</h4>
                      <p className="text-slate-400 text-xs mb-8 px-6 leading-relaxed">
                        Private photos are only visible to accepted travel buddies. Send a request to connect with {trip.userId?.name.split(' ')[0]}.
                      </p>
                      <button
                        onClick={() => {
                          if (status === 'none') handleConnect();
                          setIsShowcaseOpen(false);
                        }}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-900/40"
                      >
                        {status === 'pending' ? 'Request Sent' : 'Send Connection Request'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
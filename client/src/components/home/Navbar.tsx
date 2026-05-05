// src/components/home/Navbar.tsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { User, ArrowLeft, MessageCircle, Loader2 } from 'lucide-react';
import { useSocketContext } from '../../hooks/useSocketContext';
import { tripService } from '../../services/trip.service';
import type { ITrip } from '../../interface/ITripdetails';
import { TripStatus } from '../../constants/TripStatus';
import { Logo } from '../common/Logo';

interface NavbarProps {
  variant?: 'floating' | 'sticky';
  showBack?: boolean;
  backPath?: string;
}

import { useKycStatus } from '../../hooks/useKycStatus';

export const Navbar = ({ variant = 'floating', showBack = false, backPath = '/' }: NavbarProps) => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const { totalUnread, unreadCounts } = useSocketContext();
  const { kycStatus, isLoading } = useKycStatus();
  const [showChatDropdown, setShowChatDropdown] = useState(false);
  const [chatTrips, setChatTrips] = useState<ITrip[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowChatDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenChatDropdown = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowChatDropdown(prev => !prev);
    if (chatTrips.length === 0) {
      try {
        setLoadingChats(true);
        const data = await tripService.getUserTrips(user.id, 1, 20);
        // Show trips that have a group chat (any status except cancelled)
        const activeTrips = data.trips.filter(t => t.status !== TripStatus.CANCELLED);
        setChatTrips(activeTrips);
      } catch {
        setChatTrips([]);
      } finally {
        setLoadingChats(false);
      }
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const isFloating = variant === 'floating';

  return (
    <div
      className={`${isFloating ? 'fixed top-4 lg:top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl' : 'sticky top-0 w-full bg-white border-b border-slate-100'} z-[100] transition-all duration-300`}
    >
      <nav
        className={`flex justify-between items-center ${isFloating ? 'px-4 md:px-8 py-3 md:py-4 bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-2xl md:rounded-[2rem]' : 'px-4 md:px-6 py-3'}`}
      >
        <div className="flex items-center gap-2 md:gap-4">
          {showBack && (
            <button
              onClick={() => navigate(backPath)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <Logo size="md" />
        </div>

        <div className="flex gap-2 md:gap-4 items-center">
          {user ? (
            <div className="flex items-center gap-2 md:gap-4">
              {!isLoading && (
                <div className="hidden sm:block">
                  {kycStatus === 'none' ? (
                    <button
                      onClick={() => navigate('/kyc-verification')}
                      className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] md:text-xs font-semibold hover:bg-amber-100 transition shadow-sm whitespace-nowrap"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                      KYC
                    </button>
                  ) : (
                    <div
                      onClick={() => navigate('/kyc-status')}
                      className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold border shadow-sm transition-all hover:scale-105 whitespace-nowrap ${
                        kycStatus === 'approved'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : kycStatus === 'rejected'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {kycStatus === 'approved' && <span>✅ Verified</span>}
                      {kycStatus === 'pending' && <span>⏳ Pending</span>}
                      {kycStatus === 'rejected' && <span>❌ Rejected</span>}
                    </div>
                  )}
                </div>
              )}

              {/* Chat Icon with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <div
                  onClick={handleOpenChatDropdown}
                  className="relative cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-all group"
                >
                  <MessageCircle
                    size={20}
                    className={`transition-colors ${showChatDropdown ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'}`}
                  />
                  {totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
                      {totalUnread}
                    </span>
                  )}
                </div>

                {/* Dropdown */}
                {showChatDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-50">
                    <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Group Chats
                      </p>
                      <button
                        onClick={() => navigate('/profile')}
                        className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700"
                      >
                        View Profile
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {loadingChats ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 size={20} className="animate-spin text-indigo-400" />
                        </div>
                      ) : chatTrips.length > 0 ? (
                        chatTrips.map(trip => {
                          const unread = unreadCounts[trip._id] || 0;
                          return (
                            <div
                              key={trip._id}
                              onClick={() => {
                                navigate(`/group-chat/${trip._id}`);
                                setShowChatDropdown(false);
                              }}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors group border-b border-slate-50/80"
                            >
                              <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0">
                                {trip.destination.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate">
                                  {trip.title || trip.destination}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium capitalize">
                                  {trip.status}
                                </p>
                              </div>
                              {unread > 0 && (
                                <span className="bg-red-500 text-white text-[9px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                                  {unread}
                                </span>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-8 text-center">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                            No active trips
                          </p>
                          <button
                            disabled={isLoading}
                            onClick={() => {
                              if (kycStatus === 'approved') {
                                navigate('/create-trip');
                              } else if (kycStatus === 'pending') {
                                navigate('/kyc-status');
                              } else {
                                navigate('/kyc-verification');
                              }
                              setShowChatDropdown(false);
                            }}
                            className="mt-2 text-xs text-indigo-500 font-bold hover:text-indigo-700 disabled:opacity-50"
                          >
                            {isLoading
                              ? 'Checking status...'
                              : kycStatus === 'approved'
                                ? 'Create a trip →'
                                : kycStatus === 'pending'
                                  ? 'Verification pending...'
                                  : 'Complete KYC to create trip →'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 md:px-3 md:py-2 rounded-xl transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition overflow-hidden border border-indigo-100">
                  {user.avatarURL ? (
                    <img src={user.avatarURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <span className="hidden md:block text-gray-600 text-sm font-medium">
                  Hi, <span className="text-indigo-600 font-bold">{user.name.split(' ')[0]}</span>
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="text-xs md:text-sm font-bold text-slate-400 hover:text-red-500 transition-colors px-2 py-1"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-2 lg:gap-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-600 text-sm md:text-base font-medium px-2"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-4 md:px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm md:text-base font-medium shadow-lg shadow-indigo-100"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

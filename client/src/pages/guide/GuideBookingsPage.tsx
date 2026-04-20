import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Filter,
  Search,
  Loader2,
  CalendarCheck,
  MapPin,
  User,
  MessageSquare,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { authService } from '../../services/c.authService';
import { tripService } from '../../services/c.trip.service';
import { GuideHeader } from './GuideHeader';
import { GuideSidebar } from './GuideSidebar';
import type { ITrip } from '../../interface/ITripdetails';
import toast from 'react-hot-toast';
import { Pagination } from '../../components/Pagination';

export const GuideBookingsPage = () => {
  const user = authService.getCurrentUser();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<ITrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'planned' | 'ongoing' | 'completed'>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 5;
  const [paginationLoading, setPaginationLoading] = useState(false);

  const fetchBookings = async (pageNum: number = 1) => {
    let currentUser = user;

    // Self-healing: Re-fetch profile if guideProfile is missing
    if (currentUser?.role === 'guide' && !currentUser?.guideProfile?._id) {
      console.log('DEBUG: Bookings: Guide profile missing. Re-syncing...');
      try {
        currentUser = await authService.getProfile(currentUser.id);
      } catch (error) {
        console.error('DEBUG: Failed to re-sync profile in Bookings:', error);
      }
    }

    if (!currentUser?.guideProfile?._id) {
      setLoading(false);
      return;
    }

    try {
      if (pageNum === 1 && !paginationLoading) setLoading(true);
      else setPaginationLoading(true);

      console.log(
        'DEBUG: Fetching bookings for guide ID:',
        currentUser.guideProfile._id,
        'page:',
        pageNum
      );
      const data = await tripService.getGuideTrips(currentUser.guideProfile._id, pageNum, LIMIT);
      console.log('DEBUG: Bookings data received:', data);

      setTrips(data.trips);
      setTotal(data.total);
    } catch (err) {
      console.error('DEBUG: Error in fetchBookings:', err);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(page);
  }, [user?.id, page]);

  const filteredTrips = filter === 'all' ? trips : trips.filter(t => t.status === filter);

  return (
    <div className="flex bg-slate-50 min-h-screen font-outfit">
      <GuideSidebar />

      <div className="flex-1 ml-64 transition-all duration-300">
        <GuideHeader currentPage="Bookings" />
        <div className="p-10">
          <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Your Bookings</h1>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">
                Manage your adventure schedule
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
              {(['all', 'planned', 'ongoing', 'completed'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === f
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </header>

          <div className="relative">
            {paginationLoading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl animate-in fade-in duration-200">
                <Loader2 className="animate-spin text-indigo-500" size={40} />
              </div>
            )}

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                  Loading assignments...
                </p>
              </div>
            ) : filteredTrips.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-6 mb-10">
                  {filteredTrips.map(trip => (
                    <div
                      key={trip._id}
                      className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100/50 transition-all duration-500 flex flex-col lg:flex-row items-center gap-8"
                    >
                      <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex flex-col items-center justify-center border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner shrink-0">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">
                          {formatDate(trip.startDate).split(' ')[0]}
                        </span>
                        <span className="text-2xl font-black leading-none">
                          {formatDate(trip.startDate).split(' ')[1]}
                        </span>
                      </div>

                      <div className="flex-1 text-center lg:text-left min-w-0">
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-3">
                          <span
                            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm
                                                    ${
                                                      trip.status === 'completed'
                                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                        : trip.status === 'ongoing'
                                                          ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                                          : trip.status === 'planned'
                                                            ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                                            : 'bg-slate-50 text-slate-400 border border-slate-100'
                                                    }`}
                          >
                            {trip.status}
                          </span>
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                            <Clock size={12} className="text-indigo-400" />
                            {calcDays(trip.startDate, trip.endDate)} Days Trip
                          </span>
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase truncate">
                          {trip.title}
                        </h4>
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                              <MapPin size={14} className="text-indigo-500" />
                            </div>
                            <span className="text-xs font-bold text-slate-500">
                              {trip.destination}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                              <User size={14} className="text-indigo-500" />
                            </div>
                            <span className="text-xs font-bold text-slate-500">
                              Organizer:{' '}
                              {typeof trip.userId === 'object' ? trip.userId.name : 'User'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex lg:flex-col items-center lg:items-end gap-3 shrink-0">
                        <div className="text-right hidden lg:block mb-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                            Earnings
                          </p>
                          <p className="text-xl font-black text-indigo-600">
                            ₹
                            {(
                              calcDays(trip.startDate, trip.endDate) *
                              (user?.guideProfile?.hourlyRate || 0)
                            ).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => navigate(`/group-chat/${trip._id}`)}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100"
                          >
                            Open Chat <MessageSquare size={14} />
                          </button>
                          <button className="flex items-center gap-2 px-6 py-2 bg-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                            View Details <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {filter === 'all' && (
                  <Pagination
                    currentPage={page}
                    totalPages={Math.ceil(total / LIMIT)}
                    onPageChange={p => setPage(p)}
                  />
                )}
              </>
            ) : (
              <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 p-24 text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                  <CalendarCheck className="text-slate-200" size={48} />
                </div>
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">
                  No bookings found
                </h4>
                <p className="text-slate-400 font-medium max-w-xs mx-auto mt-4">
                  Try changing your filters or wait for travelers to book your expert services.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const formatDate = (dateStr: string | Date) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const calcDays = (start: string | Date, end: string | Date) => {
  const days =
    Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return days;
};

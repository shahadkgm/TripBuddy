import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Clock,
  IndianRupee,
  Calendar,
  MessageSquare,
  MapPin,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { authService } from '../../services/auth.service';
import { GuideLayout } from './GuideLayout';
import toast from 'react-hot-toast';
import { tripService } from '../../services/trip.service';
import { TripStatus } from '../../constants/TripStatus';
import type { ITrip } from '../../interface/ITripdetails';
import { Pagination } from '../../components/Pagination';

export const GuideDashboard = () => {
  const user = authService.getCurrentUser();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<ITrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [, setPaginationLoading] = useState(false);
  const LIMIT = 5;

  const [stats, setStats] = useState({
    totalBookings: 0,
    rating: 5.0,
    earned: 0,
    status: 'Verified',
  });

  useEffect(() => {
    const fetchGuideData = async () => {
      let currentUser = user;

      // Self-healing: If user is a guide but guideProfile is missing from local state, re-fetch profile
      if (currentUser?.role === 'guide' && !currentUser?.guideProfile?._id) {
        console.log(
          'DEBUG: Guide profile missing in local state. Attempting to re-sync user profile...'
        );
        try {
          currentUser = await authService.getProfile(currentUser.id);
          if (currentUser?.guideProfile?._id) {
            console.log('DEBUG: Profile re-synced successfully:', currentUser);
          } else {
            console.warn('DEBUG: No guideProfile._id found even after re-sync attempt');
          }
        } catch (_error) {
          console.error(_error);
        }
      }

      if (!currentUser?.guideProfile?._id) {
        setLoading(false);
        return;
      }
      try {
        if (page === 1) setLoading(true);
        else setPaginationLoading(true);

        const data = await tripService.getGuideTrips(currentUser.guideProfile._id, page, LIMIT);

        const guideTrips = data.trips;
        setTrips(guideTrips);
        setTotalPages(Math.ceil(data.total / LIMIT));

        // Calculate stats (Note: Stats are calculated from all trips if backend supports it,
        // but here we keep the current logic of calculating from the returned page)
        const completedTrips = guideTrips.filter(t => t.status === TripStatus.COMPLETED);
        const earnings = completedTrips.reduce((acc, trip) => {
          const days =
            Math.ceil(
              (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
                (1000 * 60 * 60 * 24)
            ) + 1;
          return acc + days * (currentUser?.guideProfile?.dailyRate || 0);
        }, 0);

        setStats(prev => ({
          ...prev,
          totalBookings: data.total,
          earned: earnings,
        }));
      } catch (_err) {
        console.error('Error fetching guide trips:', _err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
        setPaginationLoading(false);
      }
    };
    fetchGuideData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.guideProfile?._id, page]);

  return (
    <GuideLayout currentPage="Dashboard">
      <div className="mb-12 relative">
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
            Hi, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-3">
            Check your latest adventure assignments
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          icon={<Calendar className="text-indigo-600" />}
          label="Total Trips"
          value={stats.totalBookings}
          color="indigo"
        />
        <StatCard
          icon={<Star className="text-amber-500" />}
          label="Avg. Rating"
          value={stats.rating}
          color="amber"
        />
        <StatCard
          icon={<IndianRupee className="text-emerald-600" />}
          label="Total Earned"
          value={`₹${stats.earned.toLocaleString()}`}
          color="emerald"
        />
        <StatCard
          icon={<Clock className="text-slate-600" />}
          label="Profile Status"
          value={stats.status}
          color="slate"
        />
      </div>

      {/* Trips Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
            Upcoming Assignments
          </h3>
          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
            {trips.length} Total
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
              Syncing assignments...
            </p>
          </div>
        ) : trips.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {trips.map(trip => (
              <div
                key={trip._id}
                className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100/50 transition-all duration-500 flex flex-col md:flex-row items-center gap-8"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex flex-col items-center justify-center border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                    Trips
                  </span>
                  <Calendar size={24} className="mt-1" />
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
                    {trip.title}
                  </h4>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                      <MapPin size={14} className="text-indigo-500" />
                      {trip.destination}
                    </span>
                    <span className="text-slate-200">•</span>
                    <span className="text-xs font-bold text-slate-500">
                      {new Date(trip.startDate).toLocaleDateString()} -{' '}
                      {new Date(trip.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-2">
                  <span
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm
                                ${
                                  trip.status === TripStatus.COMPLETED
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : trip.status === TripStatus.ONGOING
                                      ? 'bg-blue-50 text-blue-600'
                                      : trip.status === TripStatus.PLANNED
                                        ? 'bg-amber-50 text-amber-600'
                                        : 'bg-slate-50 text-slate-400'
                                }`}
                  >
                    {trip.status}
                  </span>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => navigate(`/group-chat/${trip._id}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100"
                    >
                      Open Chat <MessageSquare size={14} />
                    </button>
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors py-2">
                      View Details <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Component */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center pb-4">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={newPage => {
                    setPage(newPage);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-100 p-20 text-center shadow-xl shadow-slate-100/50">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <MessageSquare className="text-slate-200" size={40} />
            </div>
            <h4 className="text-2xl font-black text-slate-900 tracking-tight">
              No adventures assigned yet
            </h4>
            <p className="text-slate-400 font-medium max-w-xs mx-auto mt-3">
              Once travelers book your services, they will appear here in your dashboard.
            </p>
          </div>
        )}
      </div>
    </GuideLayout>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  color: string;
}) => (
  <div className="group bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-start gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div
      className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-50 group-hover:bg-${color}-600 group-hover:text-white transition-all duration-300`}
    >
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors uppercase">
        {value}
      </p>
    </div>
  </div>
);

import { useState, useMemo, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Star,
  Clock,
  IndianRupee,
  Calendar,
  MessageSquare,
  MapPin,
  ChevronRight,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { authService } from '../../services/auth.service';
import { GuideLayout } from './GuideLayout';
import { tripService } from '../../services/trip.service';
import { TripStatus } from '../../constants/TripStatus';
import { Pagination } from '../../components/Pagination';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

export const GuideDashboard = () => {
  const user = authService.getCurrentUser();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const LIMIT = 5;

  // React Query self-healing profile query
  const { data: currentUserProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (user?.role === 'guide' && !user?.guideProfile?._id) {
        console.log('DEBUG: Guide profile missing in local state. Attempting to re-sync user profile...');
        try {
          const profile = await authService.getProfile(user.id);
          if (profile?.guideProfile?._id) {
            console.log('debug: Profile re-synced successfully:', profile);
            return profile;
          }
        } catch (_error) {
          console.error(_error);
        }
      }
      return user;
    },
    initialData: user,
  });

  const guideId = currentUserProfile?.guideProfile?._id;

  // React Query fetch guide trips
  const { data: dashboardData, isLoading: loading } = useQuery({
    queryKey: ['guide-dashboard', guideId, page],
    queryFn: () => tripService.getGuideTrips(guideId!, page, LIMIT),
    enabled: !!guideId,
  });

  const trips = useMemo(() => dashboardData?.trips || [], [dashboardData?.trips]);
  const totalTripsCount = dashboardData?.total || 0;
  const totalPages = Math.ceil(totalTripsCount / LIMIT);

  // Compute stats dynamically in render
  const stats = useMemo(() => {
    const completedTrips = trips.filter(t => t.status === TripStatus.COMPLETED);
    const earnings = completedTrips.reduce((acc, trip) => {
      const days =
        Math.ceil(
          (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
        ) + 1;
      return acc + days * (currentUserProfile?.guideProfile?.dailyRate || 0);
    }, 0);

    return {
      totalBookings: totalTripsCount,
      rating: 5.0,
      earned: earnings,
      status: 'Verified',
    };
  }, [trips, totalTripsCount, currentUserProfile?.guideProfile?.dailyRate]);

  // Compute chartData dynamically in render
  const chartData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        monthNum: d.getMonth(),
        year: d.getFullYear(),
        Earnings: 0,
        Bookings: 0,
      };
    });

    trips.forEach(trip => {
      const tripDate = new Date(trip.startDate);
      const tripMonth = tripDate.getMonth();
      const tripYear = tripDate.getFullYear();

      const match = last6Months.find(m => m.monthNum === tripMonth && m.year === tripYear);
      if (match) {
        match.Bookings += 1;
        if (trip.status === TripStatus.COMPLETED) {
          const days = Math.ceil(
            (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
          ) + 1;
          match.Earnings += days * (currentUserProfile?.guideProfile?.dailyRate || 0);
        }
      }
    });

    return last6Months;
  }, [trips, currentUserProfile?.guideProfile?.dailyRate]);

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

      {/* Chart Section */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 rounded-2xl">
              <TrendingUp size={20} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Performance Analytics</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                Monthly Earnings & Bookings Over Time
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              Earnings (₹)
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Bookings
            </span>
          </div>
        </div>

        <div className="h-[300px] w-full">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="earningsColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                />
                <RechartsTooltip
                  cursor={{ stroke: '#f1f5f9', strokeWidth: 1 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-slate-100 shadow-2xl space-y-2">
                          <p className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-1.5">
                            {data.month} {data.year}
                          </p>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-6">
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Earnings:</span>
                              <span className="text-xs font-black text-indigo-600">₹{data.Earnings.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between gap-6">
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Bookings:</span>
                              <span className="text-xs font-black text-emerald-600">{data.Bookings}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="Earnings"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#earningsColor)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="Bookings"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#10b981' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
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
                                ${trip.status === TripStatus.COMPLETED
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
                    <button
                      onClick={() => navigate(`/guide/trip-request/${trip._id}/view`)}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors py-2"
                    >
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

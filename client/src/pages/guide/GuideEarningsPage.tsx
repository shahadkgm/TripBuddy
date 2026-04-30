import { useState, useEffect, type ReactNode } from 'react';
import {
  IndianRupee,
  TrendingUp,
  ArrowUpRight,
  Loader2,
  Download,
  BarChart3,
  Clock,
} from 'lucide-react';
import { authService } from '../../services/auth.service';
import { tripService } from '../../services/trip.service';
import { GuideLayout } from './GuideLayout';
import type { ITrip } from '../../interface/ITripdetails';
import { TripStatus } from '../../constants/TripStatus';
import { Pagination } from '../../components/Pagination';
import toast from 'react-hot-toast';

export const GuideEarningsPage = () => {
  const [currentUser] = useState(authService.getCurrentUser());
  const [trips, setTrips] = useState<ITrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const LIMIT = 5;

  const [stats, setStats] = useState({
    totalEarned: 0,
    pendingPayouts: 0,
    completedTrips: 0,
    averagePerTrip: 0,
  });

  useEffect(() => {
    const fetchEarnings = async () => {
      const activeUser = currentUser;
      const activeGuideId = activeUser?.guideProfile?._id;
      
      if (!activeGuideId) {
        setLoading(false);
        return;
      }

      try {
        if (page === 1) setLoading(true);
        else setPaginationLoading(true);

        const data = await tripService.getGuideTrips(activeGuideId, page, LIMIT);
        const currentRate = activeUser?.guideProfile?.dailyRate || 0;
        
        setTrips(data.trips);
        setTotalPages(Math.ceil(data.total / LIMIT));

        const completed = data.trips.filter(t => t.status === TripStatus.COMPLETED);
        const earnings = completed.reduce((acc, trip) => {
          const days = calcDays(trip.startDate, trip.endDate);
          return acc + days * currentRate;
        }, 0);

        const pending = data.trips
          .filter(t => t.status === TripStatus.ONGOING || t.status === TripStatus.CONFIRMED)
          .reduce((acc, trip) => {
            const days = calcDays(trip.startDate, trip.endDate);
            return acc + days * currentRate;
          }, 0);

        setStats({
          totalEarned: earnings,
          pendingPayouts: pending,
          completedTrips: completed.length,
          averagePerTrip: completed.length > 0 ? earnings / completed.length : 0,
        });
      } catch (_err) {
        toast.error('Failed to load earnings data');
      } finally {
        setLoading(false);
        setPaginationLoading(false);
      }
    };
    fetchEarnings();
  }, [currentUser?.guideProfile?._id, page]);

  return (
    <GuideLayout currentPage="Earnings">

          <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight text-center md:text-left pt-12 md:pt-0">
                Financial Overview
              </h1>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 text-center md:text-left">
                Track your revenue and payouts
              </p>
            </div>
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm mx-auto md:mx-0">
              <Download size={16} /> Export Statement
            </button>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <EarningStat
              label="Total Revenue"
              value={`₹${stats.totalEarned.toLocaleString()}`}
              icon={<IndianRupee size={20} />}
              trend="+12%"
              color="indigo"
            />
            <EarningStat
              label="Pending Payouts"
              value={`₹${stats.pendingPayouts.toLocaleString()}`}
              icon={<Clock size={20} />}
              color="amber"
            />
            <EarningStat
              label="Avg. per Assignment"
              value={`₹${stats.averagePerTrip.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              icon={<TrendingUp size={20} />}
              color="emerald"
            />
            <EarningStat
              label="Trips Finished"
              value={stats.completedTrips}
              icon={<BarChart3 size={20} />}
              color="slate"
            />
          </div>

          <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden relative">
            {paginationLoading && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              </div>
            )}
            
            <div className="px-6 md:px-10 py-8 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between bg-slate-50/50 gap-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                Payment History
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase mr-2">
                  Filter By:
                </span>
                <select className="bg-transparent text-[10px] font-black uppercase tracking-widest text-indigo-600 focus:outline-none cursor-pointer">
                  <option>All Status</option>
                  <option>Completed</option>
                  <option>Pending</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                    <th className="px-6 md:px-10 py-6 whitespace-nowrap">Reference Trip</th>
                    <th className="px-6 md:px-10 py-6 whitespace-nowrap">Date</th>
                    <th className="px-6 md:px-10 py-6 whitespace-nowrap">Amount</th>
                    <th className="px-6 md:px-10 py-6 whitespace-nowrap">Status</th>
                    <th className="px-6 md:px-10 py-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : trips.length > 0 ? (
                    trips.map(trip => (
                      <tr key={trip._id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 md:px-10 py-6">
                          <p className="text-sm font-black text-slate-900 uppercase truncate max-w-[150px] md:max-w-[200px]">
                            {trip.title}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1">
                            {trip.destination}
                          </p>
                        </td>
                        <td className="px-6 md:px-10 py-6 text-xs font-bold text-slate-500 whitespace-nowrap">
                          {new Date(trip.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 md:px-10 py-6 whitespace-nowrap">
                          <span className="text-sm font-black text-slate-900">
                            ₹
                            {(
                              calcDays(trip.startDate, trip.endDate) *
                              (currentUser?.guideProfile?.dailyRate || 0)
                            ).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 md:px-10 py-6">
                          <span
                            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap
                                              ${trip.status === TripStatus.COMPLETED ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}
                          >
                            {trip.status === TripStatus.COMPLETED ? 'Paid' : 'Escrowed'}
                          </span>
                        </td>
                        <td className="px-6 md:px-10 py-6 text-right">
                          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                            <Download size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          No earnings records found
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="p-6 md:p-10 border-t border-slate-50">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
    </GuideLayout>
  );
};

const EarningStat = ({
  label,
  value,
  icon,
  trend,
  color,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  color?: string;
}) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
    <div
      className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700`}
    />

    <div
      className={`w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-50 text-${color}-600 mb-6 relative z-10 group-hover:bg-${color}-600 group-hover:text-white transition-all duration-500`}
    >
      {icon}
    </div>

    <div className="relative z-10">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <div className="flex items-center gap-3">
        <h4 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{value}</h4>
        {trend && (
          <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
            <ArrowUpRight size={10} /> {trend}
          </span>
        )}
      </div>
    </div>
  </div>
);

const calcDays = (start: string | Date, end: string | Date) => {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

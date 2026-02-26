import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Clock, Loader2, UserCheck } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import api from "../../utils/api";
import toast from 'react-hot-toast';

interface DashboardStats {
  totalUsers: number;
  totalGuides: number;
  pendingApplications: number;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get('/api/admin/stats');
        console.log("from dashboard", data)
        setStats(data.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        {/* total Users */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-[#5537ee] hover:shadow-xl transition duration-300 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Users</p>
              {isLoading ? (
                <div className="h-10 w-16 bg-gray-100 animate-pulse rounded-lg mt-1"></div>
              ) : (
                <h2 className="text-4xl font-extrabold text-[#1e293b]">{stats?.totalUsers || 0}</h2>
              )}
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl">
              <Users className="text-[#5537ee] w-6 h-6" />
            </div>
          </div>
          <span className="text-xs text-[#5537ee] font-medium mt-4 inline-block  items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5537ee]"></span>
            Community
          </span>
        </div>

        {/* total Guides */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-emerald-500 hover:shadow-xl transition duration-300 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Guides</p>
              {isLoading ? (
                <div className="h-10 w-16 bg-gray-100 animate-pulse rounded-lg mt-1"></div>
              ) : (
                <h2 className="text-4xl font-extrabold text-[#1e293b]">{stats?.totalGuides || 0}</h2>
              )}
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <UserCheck className="text-emerald-600 w-6 h-6" />
            </div>
          </div>
          <span className="text-xs text-emerald-600 font-medium mt-4 inline-block  items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Experts
          </span>
        </div>

        {/* Pending Verifications */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-yellow-500 hover:shadow-xl transition duration-300 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Pending Requests</p>
              {isLoading ? (
                <div className="h-10 w-16 bg-gray-100 animate-pulse rounded-lg mt-1"></div>
              ) : (
                <h2 className="text-4xl font-extrabold text-[#1e293b]">{stats?.pendingApplications || 0}</h2>
              )}
            </div>
            <div className="p-3 bg-yellow-50 rounded-xl">
              <Clock className="text-yellow-600 w-6 h-6" />
            </div>
          </div>
          <span className="text-xs text-yellow-600 font-medium mt-4 inline-block  items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
            Review Required
          </span>
        </div>

        {/* System Health */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-slate-400 opacity-60">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">System Health</p>
          <h2 className="text-4xl font-extrabold text-[#1e293b]">100%</h2>
          <span className="text-xs text-slate-500 font-medium mt-4 inline-block">All systems operational</span>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 min-h-75 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            {isLoading ? (
              <Loader2 className="text-[#5537ee] animate-spin" size={32} />
            ) : (
              <LayoutDashboard className="text-slate-300" size={36} />
            )}
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Platform Overview</h3>
          <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
            Welcome to the central command. Monitor community growth and manage guide applications efficiently.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};
import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Clock, Loader2, UserCheck, Map, CreditCard, ChevronRight, TrendingUp } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import api from "../../utils/api";
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface DashboardStats {
  totalUsers: number;
  totalGuides: number;
  pendingApplications: number;
  totalTrips: number;
  totalPayments: number;
}

export const AdminDashboard = () => {
  const navigate = useNavigate();
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

        {/* Total Trips */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-indigo-500 hover:shadow-xl transition duration-300 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Trips</p>
              {isLoading ? (
                <div className="h-10 w-16 bg-gray-100 animate-pulse rounded-lg mt-1"></div>
              ) : (
                <h2 className="text-4xl font-extrabold text-[#1e293b]">{stats?.totalTrips || 0}</h2>
              )}
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl">
              <Map className="text-indigo-600 w-6 h-6" />
            </div>
          </div>
          <span className="text-xs text-indigo-600 font-medium mt-4 inline-block  items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Active Platform Escapes
          </span>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8 hover:shadow-xl transition-shadow mb-8">
        <div className="flex items-center gap-6">
          <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center shadow-inner">
            {isLoading ? (
              <Loader2 className="text-indigo-600 animate-spin" size={32} />
            ) : (
              <CreditCard className="text-indigo-600" size={36} />
            )}
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800 mb-1">Financial Overview</h3>
            <p className="text-sm text-slate-500 font-medium">Monitor all successful and pending escrow payments.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
          <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 flex flex-col items-center min-w-[140px]">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Total Payments</p>
            {isLoading ? (
                <div className="h-8 w-16 bg-slate-200 animate-pulse rounded-md mt-1"></div>
            ) : (
                <p className="text-3xl font-extrabold text-indigo-600">{stats?.totalPayments || 0}</p>
            )}
            <p className="text-[10px] text-emerald-600 font-bold mt-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 bg-opacity-50">+ Growing</p>
          </div>
          
          <button 
            onClick={() => navigate('/admin/payments')}
            className="w-full md:w-auto px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs tracking-widest uppercase shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            Manage Payments <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {!isLoading && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 lg:col-span-2 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-50 rounded-lg"><TrendingUp size={20} className="text-indigo-600" /></div>
              <h3 className="text-lg font-black text-slate-800">Platform Analytics</h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Users', count: stats.totalUsers },
                  { name: 'Trips', count: stats.totalTrips },
                  { name: 'Payments', count: stats.totalPayments },
                  { name: 'Pending Apps', count: stats.pendingApplications }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} />
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow flex flex-col">
            <h3 className="text-lg font-black text-slate-800 mb-8">Role Distribution</h3>
            <div className="flex-1 min-h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Users', value: stats.totalUsers, color: '#4f46e5' },
                      { name: 'Guides', value: stats.totalGuides, color: '#10b981' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {[
                      { name: 'Users', value: stats.totalUsers, color: '#4f46e5' },
                      { name: 'Guides', value: stats.totalGuides, color: '#10b981' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px', fontWeight: 600, color: '#475569'}}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
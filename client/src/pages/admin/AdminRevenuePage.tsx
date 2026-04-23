import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  RotateCcw, 
  Clock, 
  BarChart3, 
  PieChart as PieChartIcon,
  Download,
  Calendar,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { AdminLayout } from '../../components/admin/AdminLayout';
import api from '../../utils/api';

interface RevenueStats {
  totalRevenue: number;
  totalRefunds: number;
  escrowedAmount: number;
  totalCount: number;
  platformCommission: number;
  netRevenue: number;
  monthlyTrend: {
    _id: string;
    revenue: number;
    count: number;
  }[];
  byPaymentType: {
    _id: string;
    total: number;
    count: number;
  }[];
  topTrips: {
    _id: string;
    revenue: number;
    transactions: number;
    title: string;
    destination: string;
  }[];
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const AdminRevenuePage = () => {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('all'); // all, month, quarter, year

  useEffect(() => {
    fetchStats();
  }, [range]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      let params: Record<string, string> = {};
      const now = new Date();
      if (range === 'month') {
        params = { from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString() };
      } else if (range === 'quarter') {
        params = { from: new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString() };
      } else if (range === 'year') {
        params = { from: new Date(now.getFullYear(), 0, 1).toISOString() };
      }

      const { data } = await api.get('/api/admin/revenue/stats', { params });
      setStats(data.data);
    } catch (error) {
      toast.error('Failed to load revenue statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleExport = () => {
    if (!stats) return;
    
    const csvData = [
      ['Metric', 'Value'],
      ['Total Revenue', stats.totalRevenue],
      ['Platform Commission (10%)', stats.platformCommission],
      ['Total Refunds', stats.totalRefunds],
      ['In Escrow', stats.escrowedAmount],
      ['Net Revenue', stats.netRevenue],
      ['Total Transactions', stats.totalCount],
      [],
      ['Monthly Trend'],
      ['Month', 'Revenue', 'Count'],
      ...stats.monthlyTrend.map(m => [m._id, m.revenue, m.count]),
      [],
      ['Revenue by Payment Type'],
      ['Type', 'Total', 'Count'],
      ...stats.byPaymentType.map(t => [t._id, t.total, t.count]),
      [],
      ['Top Revenue Generating Trips'],
      ['Title', 'Destination', 'Revenue', 'Transactions'],
      ...stats.topTrips.map(t => [t.title, t.destination, t.revenue, t.transactions])
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + csvData.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `revenue_report_${range}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported successfully');
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Revenue Management</h2>
            <p className="text-sm text-gray-500">Financial performance and platform earnings overview</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative inline-block w-full md:w-48">
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer pr-10"
              >
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="quarter">Last 3 Months</option>
                <option value="year">This Year</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <button
              onClick={handleExport}
              disabled={loading || !stats}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition disabled:opacity-50 whitespace-nowrap"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="p-3 bg-indigo-50 rounded-2xl w-fit mb-4 relative z-10">
              <DollarSign size={24} className="text-indigo-600" />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Revenue</p>
            {loading ? (
              <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-lg mt-2"></div>
            ) : (
              <h3 className="text-2xl font-black text-slate-800">{formatCurrency(stats?.totalRevenue || 0)}</h3>
            )}
            <div className="mt-4 flex items-center gap-1.5">
              <div className="flex h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[70%]"></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="p-3 bg-emerald-50 rounded-2xl w-fit mb-4 relative z-10">
              <TrendingUp size={24} className="text-emerald-600" />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Platform Earnings</p>
            {loading ? (
              <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-lg mt-2"></div>
            ) : (
              <h3 className="text-2xl font-black text-slate-800">{formatCurrency(stats?.platformCommission || 0)}</h3>
            )}
            <p className="text-[10px] text-emerald-600 font-bold mt-1 uppercase tracking-tight">10% standard fee</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="p-3 bg-rose-50 rounded-2xl w-fit mb-4 relative z-10">
              <RotateCcw size={24} className="text-rose-600" />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Refunds</p>
            {loading ? (
              <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-lg mt-2"></div>
            ) : (
              <h3 className="text-2xl font-black text-slate-800">{formatCurrency(stats?.totalRefunds || 0)}</h3>
            )}
            <p className="text-[10px] text-rose-500 font-bold mt-1 uppercase tracking-tight">Returned to users</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="p-3 bg-amber-50 rounded-2xl w-fit mb-4 relative z-10">
              <Clock size={24} className="text-amber-600" />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">In Escrow</p>
            {loading ? (
              <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-lg mt-2"></div>
            ) : (
              <h3 className="text-2xl font-black text-slate-800">{formatCurrency(stats?.escrowedAmount || 0)}</h3>
            )}
            <p className="text-[10px] text-amber-600 font-bold mt-1 uppercase tracking-tight">Held for completion</p>
          </div>
        </div>

        {/* Charts Row 1: Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <BarChart3 size={20} className="text-indigo-600" />
                </div>
                <h3 className="text-lg font-black text-slate-800">Revenue Growth Trend</h3>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.monthlyTrend || []}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="_id" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}}
                    tickFormatter={(value) => `₹${value >= 1000 ? (value/1000).toFixed(0)+'k' : value}`}
                  />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: string | number | undefined | readonly (string | number)[]) => [formatCurrency(Number(Array.isArray(value) ? value[0] : (value || 0))), 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-pink-50 rounded-lg">
                <PieChartIcon size={20} className="text-pink-600" />
              </div>
              <h3 className="text-lg font-black text-slate-800">Payment Breakdown</h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.byPaymentType || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="total"
                    nameKey="_id"
                  >
                    {(stats?.byPaymentType || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '16px' }}
                    formatter={(value: string | number | undefined | readonly (string | number)[]) => formatCurrency(Number(Array.isArray(value) ? value[0] : (value || 0)))}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2: Top Trips */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Calendar size={20} className="text-amber-600" />
            </div>
            <h3 className="text-lg font-black text-slate-800">Top Performing Trips (By Revenue)</h3>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.topTrips || []} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="title" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{fill: '#1e293b', fontSize: 13, fontWeight: 700}}
                  width={150}
                />
                <RechartsTooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none' }}
                  formatter={(value: string | number | undefined | readonly (string | number)[]) => formatCurrency(Number(Array.isArray(value) ? value[0] : (value || 0)))}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#4f46e5" 
                  radius={[0, 8, 8, 0]} 
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

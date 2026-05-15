import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  ShieldAlert,
  MapPin,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { reportService } from '../../services/report.service';
import toast from 'react-hot-toast';
import { AdminLayout } from '../../components/admin/AdminLayout';

interface IReport {
  _id: string;
  reporterId: {
    _id: string;
    name: string;
    email: string;
    avatarURL?: string;
  };
  targetId: {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatarURL?: string;
  };
  targetType: string;
  tripId: {
    _id: string;
    title: string;
    destination: string;
  };
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

const ReportManagementPage: React.FC = () => {
  const [reports, setReports] = useState<IReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<IReport | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await reportService.getAllReports();
      setReports(data || []);
    } catch (_err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (reportId: string, status: string) => {
    try {
      await reportService.updateReportStatus(reportId, status);
      toast.success(`Report marked as ${status}`);
      setSelectedReport(null);
      fetchReports();
    } catch (_err) {
      toast.error('Failed to update status');
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === 'all' || report.status === filter;
    const matchesSearch =
      report.targetId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reporterId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'resolved':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'dismissed':
        return 'bg-slate-50 text-slate-400 border-slate-100';
      default:
        return 'bg-slate-50 text-slate-500';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm shadow-slate-100/50">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <ShieldAlert size={12} /> Moderation Desk
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Safety Reports</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Protecting the community through verified moderation
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            {(['all', 'pending', 'resolved', 'dismissed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === f
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Main Table Area */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
          {/* Search Bar Container */}
          <div className="p-6 border-b border-slate-50 bg-slate-50/30">
            <div className="relative max-w-xl">
              <Search
                className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"
                size={18}
              />
              <input
                type="text"
                placeholder="Filter by reporter, target or reason..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all placeholder:text-slate-300 shadow-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Reporter
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Violation Details
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Target User
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                    Status
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  [1, 2, 3, 4, 5].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-6">
                        <div className="h-12 bg-slate-100 rounded-2xl"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-24 text-center">
                      <div className="max-w-xs mx-auto">
                        <ShieldAlert size={48} className="text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                          Clear skies! No pending violations found.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map(report => (
                    <tr key={report._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              report.reporterId?.avatarURL ||
                              'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
                            }
                            className="w-10 h-10 rounded-xl object-cover shadow-sm ring-2 ring-white"
                            alt=""
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-900 truncate tracking-tight">
                              {report.reporterId?.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                              Reporter
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="max-w-xs">
                          <p className="text-sm font-black text-slate-800 tracking-tight">
                            {report.reason}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium line-clamp-1 mt-0.5">
                            "{report.description}"
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                              <MapPin size={10} /> {report.tripId?.destination}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={
                                report.targetId?.avatarURL ||
                                'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
                              }
                              className="w-10 h-10 rounded-xl object-cover shadow-sm ring-2 ring-rose-50"
                              alt=""
                            />
                            <div className="absolute -top-1 -right-1 bg-rose-500 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm"></div>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-rose-600 truncate tracking-tight">
                              {report.targetId?.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                              {report.targetType}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center">
                          <span
                            className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 shadow-sm ${getStatusStyle(report.status)}`}
                          >
                            {report.status === 'pending' && <Clock size={12} />}
                            {report.status === 'resolved' && <CheckCircle size={12} />}
                            {report.status === 'dismissed' && <XCircle size={12} />}
                            {report.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50 transition-all font-black uppercase text-[10px] flex items-center gap-2 ml-auto"
                        >
                          Manage <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Slide-over Side Panel for Report Response */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-300">
            <div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedReport(null)}
            />
            <div className="relative w-full max-w-lg bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-500">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
                    Report Details
                  </h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                    Reference: {selectedReport._id.slice(-8)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-3 hover:bg-slate-50 rounded-2xl text-slate-300 hover:text-slate-900 transition-all"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">
                    Case Context
                  </span>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-rose-50 rounded-2xl text-rose-600">
                        <AlertTriangle size={24} />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900 tracking-tight">
                          {selectedReport.reason}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                          Filed on {new Date(selectedReport.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100">
                      <p className="text-xs text-slate-600 font-medium italic leading-relaxed">
                        "{selectedReport.description}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">
                      Reporter
                    </span>
                    <div className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-3">
                      <img
                        src={
                          selectedReport.reporterId?.avatarURL ||
                          'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
                        }
                        className="w-10 h-10 rounded-xl object-cover shadow-sm"
                        alt=""
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-800 truncate tracking-tight">
                          {selectedReport.reporterId?.name}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold truncate uppercase">
                          {selectedReport.reporterId?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">
                      Target User
                    </span>
                    <div className="bg-rose-50/30 p-4 rounded-3xl border border-rose-100 flex items-center gap-3">
                      <img
                        src={
                          selectedReport.targetId?.avatarURL ||
                          'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
                        }
                        className="w-10 h-10 rounded-xl object-cover shadow-sm ring-2 ring-white"
                        alt=""
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-black text-rose-600 truncate tracking-tight">
                          {selectedReport.targetId?.name}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold truncate uppercase">
                          {selectedReport.targetType}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">
                    Associated Trip
                  </span>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 tracking-tight">
                          {selectedReport.tripId?.title}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          {selectedReport.tripId?.destination}
                        </p>
                      </div>
                    </div>
                    <ExternalLink size={18} className="text-slate-200" />
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-slate-100 bg-slate-50/50">
                {selectedReport.status === 'pending' ? (
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleUpdateStatus(selectedReport._id, 'resolved')}
                      className="flex-1 bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-emerald-100 hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={14} /> Resolve Case
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedReport._id, 'dismissed')}
                      className="flex-1 bg-white border-2 border-slate-200 text-slate-500 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle size={14} /> Dismiss Report
                    </button>
                  </div>
                ) : (
                  <div
                    className={`p-5 rounded-2xl border text-center font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 ${getStatusStyle(selectedReport.status)}`}
                  >
                    {selectedReport.status === 'resolved' ? (
                      <CheckCircle size={18} />
                    ) : (
                      <XCircle size={18} />
                    )}
                    This report has been {selectedReport.status}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ReportManagementPage;

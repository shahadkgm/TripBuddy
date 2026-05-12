import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { CheckCircle, XCircle, Eye, ShieldCheck, ShieldAlert, Clock, MapPin, Instagram, Linkedin, Globe } from 'lucide-react';
import api from '../../utils/api';
import { DataTable } from '../../components/DataTable';
import { SearchBar } from '../../components/common/SearchBar';
import { Pagination } from '../../components/Pagination';
import { RejectionModal } from '../../components/RejectionModal';
import { reportService } from '../../services/report.service';
import type { IReport } from '../../services/report.service';

interface IGuideApplication {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  bio: string;
  dailyRate: number;
  serviceArea: string;
  specialties: string[];
  avatarURL?: string;
  languages: string[];
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
  isVerified: boolean;
  status: string;
  rejectionReason?: string;
  yearsOfExperience: number;
  createdAt: string;
  kycData?: {
    uploadedAt: string;
    status: string;
    documentType: string;
    documentUrl: string;
  };
}

export const GuideManagement = () => {
  const [guides, setGuides] = useState<IGuideApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewingGuide, setViewingGuide] = useState<IGuideApplication | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 3;

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [guideToReject, setGuideToReject] = useState<string | null>(null);

  // Reports modal state
  const [reportModalGuide, setReportModalGuide] = useState<IGuideApplication | null>(null);
  const [guideReports, setGuideReports] = useState<IReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  const openReportsModal = async (guide: IGuideApplication) => {
    setReportModalGuide(guide);
    setReportsLoading(true);
    try {
      const data = await reportService.getReportsByTarget(guide.user.id);
      setGuideReports(data || []);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setReportsLoading(false);
    }
  };

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
      setCurrentPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    loadGuides();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedTerm]);

  const loadGuides = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/admin/guides', {
        params: { page: currentPage, limit, search: debouncedTerm },
      });
      console.log('from g-management', data.guides);
      setGuides(data.data.guides);
      setTotalPages(data.data.totalPages);
    } catch (_err) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/api/admin/guides/${id}/verify`);
      toast.success('Guide approved!');
      loadGuides();
    } catch (_err) {
      toast.error('Approval failed');
    }
  };

  const initiateReject = (id: string) => {
    setGuideToReject(id);
    setIsConfirmOpen(true);
  };

  const handleRejectAction = async (reason: string) => {
    if (!guideToReject) return;
    try {
      await api.patch(`/api/admin/guides/${guideToReject}`, { reason });
      toast.success('Application rejected');
      loadGuides();
    } catch (_err) {
      toast.error('Rejection failed');
    } finally {
      setIsConfirmOpen(false);
      setGuideToReject(null);
    }
  };

  const columns = [
    {
      header: 'No.',
      key: 'index',
      className: 'hidden md:table-cell',
      render: (_: IGuideApplication, index: number) => (
        <span className="text-xs font-mono text-gray-400">
          {(currentPage - 1) * limit + (index + 1)}
        </span>
      ),
    },
    {
      header: 'Applicant',
      key: 'userId',
      render: (guide: IGuideApplication) => (
        <div className="py-1 max-w-[150px] sm:max-w-[200px]">
          <div className="font-bold text-gray-900 truncate">{guide.user?.name || 'Unknown'}</div>
          <div className="text-xs text-gray-500 truncate">{guide.user?.email}</div>
          <div className="text-[11px] italic text-gray-400 line-clamp-2 mt-1" title={guide.bio}>
            "{guide.bio}"
          </div>
        </div>
      ),
    },
    {
      header: 'Exp & Area',
      key: 'yearsOfExperience',
      className: 'hidden sm:table-cell',
      render: (guide: IGuideApplication) => (
        <div className="max-w-[120px]">
          <div className="text-sm font-semibold">{guide.yearsOfExperience} years</div>
          <div className="text-xs text-gray-500 truncate">{guide.serviceArea}</div>
          <div className="text-xs font-bold text-emerald-600">₹{guide.dailyRate}/day</div>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'isVerified',
      render: (guide: IGuideApplication) => (
        <div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter border ${guide.status === 'verified'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : guide.status === 'rejected'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
          >
            {guide.status}
          </span>
          {guide.status === 'rejected' && guide.rejectionReason && (
            <div className="text-[10px] text-red-500 font-medium mt-1 max-w-[100px] leading-tight">
              Reason: {guide.rejectionReason}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Details',
      key: 'details',
      className: 'hidden lg:table-cell',
      render: (guide: IGuideApplication) => (
        <button
          onClick={() => setViewingGuide(guide)}
          className="flex items-center gap-1.5 text-[11px] font-bold text-[#5537ee] hover:text-white hover:bg-[#5537ee] bg-indigo-50/50 px-3 py-1.5 rounded-full border border-indigo-100 transition-all active:scale-95 group"
        >
          <Eye size={14} className="group-hover:scale-110 transition-transform" /> View
        </button>
      ),
    },
    {
      header: 'Reports',
      key: 'reports',
      render: (guide: IGuideApplication) => (
        <button
          onClick={() => openReportsModal(guide)}
          className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 hover:text-white hover:bg-rose-500 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 transition-all active:scale-95 group"
        >
          <ShieldAlert size={14} className="group-hover:scale-110 transition-transform" />
          View Reports
        </button>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right',
      render: (guide: IGuideApplication) => (
        <div className="flex justify-end gap-1">
          {guide.status === 'pending' && (
            <button
              onClick={() => handleApprove(guide.id)}
              className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition"
              title="Verify Application"
            >
              <CheckCircle size={18} />
            </button>
          )}
          {guide.status !== 'rejected' && (
            <button
              onClick={() => initiateReject(guide.id)}
              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
              title="Reject/Remove"
            >
              <XCircle size={18} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Guide Directory</h2>
            <p className="text-sm text-gray-500">Manage and verify guide applications</p>
          </div>
          <SearchBar
            placeholder="Search by name, email or area..."
            onSearch={val => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            className="max-w-xs"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <DataTable
            columns={columns}
            data={guides}
            loading={loading}
            emptyMessage="No guides found."
          />

          <div className="p-4 border-t bg-gray-50/30">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={page => setCurrentPage(page)}
            />
          </div>
        </div>

        {/* Modal for PDF/Image certificates & Detailed Profile */}
        {viewingGuide && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-[#5537ee] border border-indigo-100 overflow-hidden">
                    {viewingGuide.avatarURL ? (
                      <img
                        src={viewingGuide.avatarURL}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      viewingGuide.user?.name[0]
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">
                      {viewingGuide.user?.name}
                    </h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                      Guide Application Review
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingGuide(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-125">
                {/* Image/Profile Side */}
                <div className="flex-1 bg-[#1e293b] p-6 flex flex-col items-center justify-center relative group overflow-y-auto">
                  {viewingGuide.avatarURL ? (
                    <div className="relative">
                      <img
                        src={viewingGuide.avatarURL}
                        alt="Profile"
                        className="max-w-full max-h-full rounded-2xl shadow-2xl transition-all duration-500 group-hover:scale-[1.01] border-4 border-white/10"
                      />
                      <div className="absolute top-4 left-4 bg-[#5537ee] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                        PROFILE PHOTO
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400 bg-gray-800/50 p-12 rounded-full flex flex-col items-center gap-4">
                      <span className="text-5xl font-bold">{viewingGuide.user?.name[0]}</span>
                      <p className="text-xs">No profile photo uploaded</p>
                    </div>
                  )}
                </div>

                {/* Info Side */}
                <div className="w-full md:w-112.5 p-8 bg-white border-l border-gray-100 flex flex-col justify-between overflow-y-auto">
                  <div className="space-y-8">
                    <div className="flex justify-between items-start">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Application Status
                        </label>
                        <div className="mt-2 text-sm font-bold flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${viewingGuide.isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          ></span>
                          <span className="uppercase tracking-tight text-gray-700">
                            {viewingGuide.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Joined At
                        </label>
                        <p className="mt-2 text-[10px] text-slate-500 font-bold">
                          {new Date(viewingGuide.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Basic Details */}
                    <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Experience
                        </label>
                        <p className="text-sm font-bold text-gray-800">
                          {viewingGuide.yearsOfExperience || 0} Years
                        </p>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Daily Rate
                        </label>
                        <p className="text-sm font-bold text-emerald-600">
                          ₹{viewingGuide.dailyRate || 0}/day
                        </p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Service Area
                        </label>
                        <p className="text-sm font-semibold text-gray-700">
                          {viewingGuide.serviceArea || 'Not specified'}
                        </p>
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                        Biography
                      </label>
                      <div className="p-4 bg-indigo-50/30 rounded-xl border border-indigo-100/50">
                        <p className="text-xs text-indigo-900 leading-relaxed italic">
                          "{viewingGuide.bio || 'No biography provided'}"
                        </p>
                      </div>
                    </div>

                    {/* Specialties */}
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                        Specialties
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {viewingGuide.specialties && viewingGuide.specialties.length > 0 ? (
                          viewingGuide.specialties.map((s, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 bg-white text-indigo-700 text-[10px] font-bold rounded-lg border border-indigo-100 shadow-sm"
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">None specified</span>
                        )}
                      </div>
                    </div>


                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                        Languages Spoken
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {viewingGuide.languages && viewingGuide.languages.length > 0 ? (
                          viewingGuide.languages.map((l, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100 shadow-sm"
                            >
                              {l}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">None specified</span>
                        )}
                      </div>
                    </div>

                    {/* Social Presence */}
                    {viewingGuide.socialLinks && (
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                          Social Presence
                        </label>
                        <div className="flex gap-4">
                          {viewingGuide.socialLinks.instagram && (
                            <div className="flex items-center gap-2 text-xs font-medium text-pink-600 bg-pink-50 px-3 py-1.5 rounded-xl border border-pink-100">
                              <Instagram size={14} /> IG
                            </div>
                          )}
                          {viewingGuide.socialLinks.linkedin && (
                            <div className="flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                              <Linkedin size={14} /> LI
                            </div>
                          )}
                          {viewingGuide.socialLinks.website && (
                            <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
                              <Globe size={14} /> Web
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* KYC Section */}
                    {viewingGuide.kycData && (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">
                          Verified Identity (KYC)
                        </label>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                              <ShieldCheck size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900">
                                {viewingGuide.kycData.documentType}
                              </p>
                              <p className="text-[10px] text-gray-400 font-medium">
                                Status: {viewingGuide.kycData.status}
                              </p>
                            </div>
                          </div>
                          {viewingGuide.kycData.documentUrl && (
                            <a
                              href={viewingGuide.kycData.documentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-bold text-indigo-600 hover:underline"
                            >
                              View Document
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-8 border-t border-gray-100 mt-8">
                    {viewingGuide.status === 'pending' && (
                      <button
                        onClick={() => {
                          handleApprove(viewingGuide.id);
                          setViewingGuide(null);
                        }}
                        className="w-full bg-[#5537ee] hover:bg-[#4428d4] text-white py-4 rounded-xl font-bold text-xs transition-all shadow-xl shadow-indigo-100 active:scale-95 flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={18} /> Approve Application
                      </button>
                    )}
                    {viewingGuide.status !== 'rejected' && viewingGuide.status !== 'verified' && (
                      <button
                        onClick={() => {
                          initiateReject(viewingGuide.id);
                          setViewingGuide(null);
                        }}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-4 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <XCircle size={18} /> Reject Application
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reusable ConfirmModal for Rejection */}
        <RejectionModal
          isOpen={isConfirmOpen}
          onClose={() => {
            setIsConfirmOpen(false);
            setGuideToReject(null);
          }}
          onConfirm={handleRejectAction}
          title="Reject Guide Application"
          message="Please provide a reason for rejecting this guide application. This info will be shown to the applicant."
        />

        {/* Reports Slide-Over Modal */}
        {reportModalGuide && (
          <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-300">
            <div
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setReportModalGuide(null)}
            />
            <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-400">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-rose-50/40">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-rose-100 rounded-xl text-rose-600">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      Community Reports
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                      Against {reportModalGuide.user?.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setReportModalGuide(null)}
                  className="p-2 hover:bg-rose-100 rounded-xl text-slate-300 hover:text-rose-600 transition-all"
                >
                  <XCircle size={22} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {reportsLoading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
                  ))
                ) : guideReports.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle size={32} className="text-emerald-400" />
                    </div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">
                      No reports filed
                    </p>
                    <p className="text-slate-300 text-[10px] font-medium mt-1">
                      This guide has a clean record
                    </p>
                  </div>
                ) : (
                  guideReports.map(report => (
                    <div
                      key={report._id}
                      className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow"
                    >
                      {/* Reporter */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              report.reporterId?.avatarURL ||
                              `https://ui-avatars.com/api/?name=${report.reporterId?.name}`
                            }
                            className="w-8 h-8 rounded-xl object-cover shadow-sm"
                            alt=""
                          />
                          <div>
                            <p className="text-xs font-black text-slate-800 tracking-tight">
                              {report.reporterId?.name}
                            </p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                              Reporter
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${report.status === 'pending'
                              ? 'bg-amber-50 text-amber-600 border-amber-100'
                              : report.status === 'resolved'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                : 'bg-slate-50 text-slate-400 border-slate-100'
                            }`}
                        >
                          {report.status === 'pending' && <Clock size={10} />}
                          {report.status === 'resolved' && <CheckCircle size={10} />}
                          {report.status}
                        </span>
                      </div>

                      {/* Reason */}
                      <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100/50">
                        <p className="text-[10px] font-black text-rose-700 uppercase tracking-widest mb-1">
                          {report.reason}
                        </p>
                        <p className="text-[11px] text-slate-600 font-medium italic leading-relaxed">
                          "{report.description}"
                        </p>
                      </div>

                      {/* Trip + Date */}
                      <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        <div className="flex items-center gap-1">
                          <MapPin size={10} /> {report.tripId?.destination}
                        </div>
                        <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {guideReports.length > 0 && (
                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100">
                    <div className="p-2 bg-rose-50 rounded-xl text-rose-500">
                      <ShieldAlert size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800">
                        {guideReports.length} Total Report{guideReports.length > 1 ? 's' : ''}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {guideReports.filter(r => r.status === 'pending').length} pending review
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { CheckCircle, XCircle, Eye, ShieldCheck } from 'lucide-react';
import api from '../../utils/api';
import { DataTable } from '../../components/DataTable';
import { SearchBar } from '../../components/common/SearchBar';
import { Pagination } from '../../components/Pagination';
import { RejectionModal } from '../../components/RejectionModal';

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

  // Triggered when Confirm button inside modal is clicked
  const handleConfirmReject = async () => {
    // This is now handled by the Modal's onConfirm with reason
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
      </div>
    </AdminLayout>
  );
};

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import api from '../../utils/api';
import { DataTable } from '../../components/DataTable';
import { SearchBar } from '../../components/common/SearchBar';
import { Pagination } from '../../components/Pagination';
import { ConfirmModal } from '../../components/ConfirmModal';

interface IGuideApplication {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  bio: string;
  hourlyRate: number;
  serviceArea: string;
  specialties: string[];
  avatarURL?: string;
  certificateUrl?: string;
  yearsOfExperience: number;
  isVerified: boolean;
  status: string;
  createdAt: string;
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
        params: { page: currentPage, limit, search: debouncedTerm }
      });
      console.log("from g-management", data.guides);
      setGuides(data.guides);
      setTotalPages(data.totalPages);
    } catch (err) {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/api/admin/guides/${id}/verify`);
      toast.success("Guide approved!");
      loadGuides();
    } catch (err) {
      toast.error("Approval failed");
    }
  };

  // Triggered when clicking the X button
  const initiateReject = (id: string) => {
    setGuideToReject(id);
    setIsConfirmOpen(true);
  };

  // Triggered when Confirm button inside modal is clicked
  const handleConfirmReject = async () => {
    if (!guideToReject) return;
    try {
      await api.delete(`/api/admin/guides/${guideToReject}`);
      toast.success("Application rejected");
      loadGuides();
    } catch (err) {
      toast.error("Rejection failed");
    } finally {
      setIsConfirmOpen(false);
      setGuideToReject(null);
    }
  };

  const columns = [
    {
      header: "No.",
      key: "index",
      render: (_: IGuideApplication, index: number) => (
        <span className="text-xs font-mono text-gray-400">
          {(currentPage - 1) * limit + (index + 1)}
        </span>
      )
    },
    {
      header: "Applicant",
      key: "userId",
      render: (guide: IGuideApplication) => (
        <div className="py-1">
          <div className="font-bold text-gray-900">{guide.user?.name || "Unknown"}</div>
          <div className="text-xs text-gray-500">{guide.user?.email}</div>
          <div className="text-[11px] italic text-gray-400 truncate  max-width: 180px" title={guide.bio}>
            "{guide.bio}"
          </div>
        </div>
      )
    },
    {
      header: "Exp & Area",
      key: "yearsOfExperience",
      render: (guide: IGuideApplication) => (
        <div>
          <div className="text-sm font-semibold">{guide.yearsOfExperience} years</div>
          <div className="text-xs text-gray-500 truncate  max-width: 120px;">
            {guide.serviceArea}
          </div>
          <div className="text-xs font-bold text-emerald-600">${guide.hourlyRate}/hr</div>
        </div>
      )
    },
    {
      header: "Status",
      key: "isVerified",
      render: (guide: IGuideApplication) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter border ${guide.isVerified
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
          {guide.isVerified ? 'Verified' : 'Pending'}
        </span>
      )
    },
    {
      header: "Details",
      key: "details",
      render: (guide: IGuideApplication) => (
        <button
          onClick={() => setViewingGuide(guide)}
          className="flex items-center gap-1.5 text-[11px] font-bold text-[#5537ee] hover:text-white hover:bg-[#5537ee] bg-indigo-50/50 px-3 py-1.5 rounded-full border border-indigo-100 transition-all active:scale-95 group"
        >
          <Eye size={14} className="group-hover:scale-110 transition-transform" /> View Profile
        </button>
      )
    },
    {
      header: "Actions",
      key: "actions",
      className: "text-right",
      render: (guide: IGuideApplication) => (
        <div className="flex justify-end gap-1">
          {!guide.isVerified && (
            <button
              onClick={() => handleApprove(guide.id)}
              className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition"
              title="Verify Application"
            >
              <CheckCircle size={18} />
            </button>
          )}
          <button
            onClick={() => initiateReject(guide.id)}
            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
            title="Reject/Remove"
          >
            <XCircle size={18} />
          </button>
        </div>
      )
    }
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
            onSearch={(val) => {
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
              onPageChange={(page) => setCurrentPage(page)}
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
                      <img src={viewingGuide.avatarURL} alt="" className="w-full h-full object-cover" />
                    ) : (
                      viewingGuide.user?.name[0]
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">{viewingGuide.user?.name}</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Guide Application Review</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingGuide(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-[500px]">
                {/* Image/Profile Side */}
                <div className="flex-1 bg-[#1e293b] p-6 flex flex-col items-center justify-center relative group overflow-y-auto">
                  {viewingGuide.avatarURL ? (
                    <div className="relative">
                      <img
                        src={viewingGuide.avatarURL}
                        alt="Profile"
                        className="max-w-full max-h-[100%] rounded-2xl shadow-2xl transition-all duration-500 group-hover:scale-[1.01] border-4 border-white/10"
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
                <div className="w-full md:w-[450px] p-8 bg-white border-l border-gray-100 flex flex-col justify-between overflow-y-auto">
                  <div className="space-y-8">
                    <div className="flex justify-between items-start">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Application Status</label>
                        <div className="mt-2 text-sm font-bold flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${viewingGuide.isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          <span className="uppercase tracking-tight text-gray-700">{viewingGuide.status}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Identification</label>
                        {viewingGuide.certificateUrl ? (
                          <a
                            href={viewingGuide.certificateUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-[#5537ee] hover:underline"
                          >
                            <Eye size={12} /> View Certificate
                          </a>
                        ) : (
                          <p className="mt-2 text-[10px] text-red-400 font-bold">Missing Document</p>
                        )}
                      </div>
                    </div>

                    {/* Basic Details */}
                    <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Experience</label>
                        <p className="text-sm font-bold text-gray-800">{viewingGuide.yearsOfExperience || 0} Years</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hourly Rate</label>
                        <p className="text-sm font-bold text-emerald-600">${viewingGuide.hourlyRate || 0}/hr</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Service Area</label>
                        <p className="text-sm font-semibold text-gray-700">{viewingGuide.serviceArea || 'Not specified'}</p>
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Biography</label>
                      <div className="p-4 bg-indigo-50/30 rounded-xl border border-indigo-100/50">
                        <p className="text-xs text-indigo-900 leading-relaxed italic">
                          "{viewingGuide.bio || 'No biography provided'}"
                        </p>
                      </div>
                    </div>

                    {/* Specialties */}
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Specialties</label>
                      <div className="flex flex-wrap gap-2">
                        {viewingGuide.specialties && viewingGuide.specialties.length > 0 ? (
                          viewingGuide.specialties.map((s, i) => (
                            <span key={i} className="px-3 py-1.5 bg-white text-indigo-700 text-[10px] font-bold rounded-lg border border-indigo-100 shadow-sm">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">None specified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-8 border-t border-gray-100 mt-8">
                    {!viewingGuide.isVerified && (
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
                    <button
                      onClick={() => {
                        initiateReject(viewingGuide.id);
                        setViewingGuide(null);
                      }}
                      className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-4 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} /> Reject Application
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reusable ConfirmModal for Rejection */}
        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => {
            setIsConfirmOpen(false);
            setGuideToReject(null);
          }}
          onConfirm={handleConfirmReject}
          title="Reject Application"
          message="Are you sure you want to reject this guide application? This will permanently delete their guide profile data."
          confirmText="Reject Application"
          type="danger"
        />
      </div>
    </AdminLayout>
  );
};
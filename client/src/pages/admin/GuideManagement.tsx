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
    name: string;
    email: string;
  };
  bio: string;
  hourlyRate: number;
  serviceArea: string;
  yearsOfExperience: number;
  certificateUrl?: string;
  isVerified: boolean;
}

export const GuideManagement = () => {
  const [guides, setGuides] = useState<IGuideApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 3;

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [guideToReject, setGuideToReject] = useState<string | null>(null);

  useEffect(() => {
    loadGuides();
  }, [currentPage, searchTerm]);

  const loadGuides = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/admin/guides', {
        params: { page: currentPage, limit, search: searchTerm }
      });
      console.log("from g-management", data)
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
          {guide.user ? 'Verified' : 'Pending'}
        </span>
      )
    },
    {
      header: "Documents",
      key: "certificateUrl",
      render: (guide: IGuideApplication) => (
        <button
          onClick={() => setSelectedDoc(guide.certificateUrl || null)}
          className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded transition-colors"
        >
          <Eye size={14} /> oc
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

        {/* Modal for PDF/Image certificates */}
        {selectedDoc && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl max-w-3xl w-full p-4 relative shadow-2xl">
              <button
                onClick={() => setSelectedDoc(null)}
                className="absolute -top-12 right-0 text-white flex items-center gap-2 hover:text-gray-300 transition-colors"
              >
                <XCircle size={24} /> <span className="font-medium text-sm">Close Preview</span>
              </button>
              <img
                src={selectedDoc}
                alt="Guide Certificate"
                className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
              />
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
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import api from '../../utils/api';
import { DataTable } from '../../components/DataTable';
// import { DataTable } from '../../components/common/DataTable'; // Import the reusable component

interface IGuideApplication {
  _id: string;
  userId: {
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
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/admin/guides');
      setGuides(data);
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
      setGuides(prev => prev.filter(g => g._id !== id));
    } catch (err) {
      toast.error("Approval failed");
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm("Are you sure? This will remove the guide profile.")) return;
    try {
      await api.delete(`/api/admin/guides/${id}`);
      toast.success("Application rejected");
      setGuides(prev => prev.filter(g => g._id !== id));
    } catch (err) {
      toast.error("Rejection failed");
    }
  };

  // --- Reusable Column Configuration ---
  const columns = [
    {
      header: "Applicant",
      key: "userId",
      render: (guide: IGuideApplication) => (
        <div>
          <div className="font-bold text-gray-900">{guide.userId?.name || "Unknown"}</div>
          <div className="text-xs text-gray-500">{guide.userId?.email}</div>
          <div className="text-xs italic text-gray-400 truncate max-w-[200px]" title={guide.bio}>
            "{guide.bio}"
          </div>
        </div>
      )
    },
    {
      header: "Experience & Area",
      key: "yearsOfExperience",
      render: (guide: IGuideApplication) => (
        <div>
          <div className="text-sm font-semibold">{guide.yearsOfExperience} years</div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
            {guide.serviceArea}
          </div>
          <div className="text-xs font-bold text-emerald-600">${guide.hourlyRate}/hr</div>
        </div>
      )
    },
    {
      header: "Documents",
      key: "certificateUrl",
      render: (guide: IGuideApplication) => (
        <button 
          onClick={() => setSelectedDoc(guide.certificateUrl || null)}
          className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded"
        >
          <Eye size={14} /> View Certificate
        </button>
      )
    },
    {
      header: "Actions",
      key: "actions",
      className: "text-right",
      render: (guide: IGuideApplication) => (
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => handleApprove(guide._id)} 
            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
            title="Verify Application"
          >
            <CheckCircle size={20} />
          </button>
          <button 
            onClick={() => handleReject(guide._id)} 
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
            title="Reject Application"
          >
            <XCircle size={20} />
          </button>
        </div>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Pending Guide Applications</h2>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <DataTable
            columns={columns} 
            data={guides} 
            loading={loading} 
            emptyMessage="No pending guide applications."
          />
        </div>

        {/* 🖼️ Document Viewer Modal */}
        {selectedDoc && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full p-4 relative shadow-2xl">
              <button 
                onClick={() => setSelectedDoc(null)}
                className="absolute -top-12 right-0 text-white flex items-center gap-2 hover:text-gray-300 transition-colors"
              >
                <XCircle size={24} /> <span className="font-medium">Close Preview</span>
              </button>
              <img 
                src={selectedDoc} 
                alt="Guide Certificate" 
                className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
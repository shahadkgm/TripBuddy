// client/src/pages/admin/GuideManagement.tsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import api from '../../utils/api';

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
console.log("from managem",guides)
 const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null); 

  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = async () => {
    try {
      const { data } = await api.get('/api/admin/guides');
;
      console.log("from guide management",data)
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
    if (!window.confirm("Are you sure you want to reject this application? This will remove the guide profile.")) return;
    
    try {
      await api.delete(`/api/admin/guides/${id}`);
      toast.success("Application rejected and removed");
      setGuides(prev => prev.filter(g => g._id !== id));
    } catch (err) {
      toast.error("Rejection failed");
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Pending Guide Applications</h2>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4">Applicant</th>
                <th className="p-4">Experience</th>
                <th className="p-4">Status</th>

                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
           <tbody>
          {guides.map((guide) => (
<tr key={guide._id} className="border-t hover:bg-gray-50 transition-colors">
  <td className="p-4">
    <div className="font-bold text-gray-900">{guide.userId?.name || "Unknown"}</div>
    <div className="text-xs text-gray-500">{guide.userId?.email}</div>
    <div className="text-xs italic text-gray-400 truncate max-w-[200px]" title={guide.bio}>
      "{guide.bio}"
    </div>
  </td>
  <td className="p-4">
    <div className="text-sm font-semibold">{guide.yearsOfExperience} years</div>
    <div className="text-xs text-gray-500 flex items-center gap-1">
      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
      {guide.serviceArea}
    </div>
    <div className="text-xs font-bold text-emerald-600">
      ${guide.hourlyRate}/hr
    </div>
  </td>
  <th className="p-4">Status</th>

  <td className="p-4 text-right flex justify-end gap-2">
    {/* <button 
      onClick={() => setSelectedDoc(guide.certificateUrl)}
      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
      title="View Documentation"
    >
      <Eye size={20} />
    </button> */}
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
  </td>
</tr>
          ))}
        </tbody>
        {/* 🖼️ Document Viewer Modal */}
        {selectedDoc && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full p-4 relative">
              <button 
                onClick={() => setSelectedDoc(null)}
                className="absolute -top-10 right-0 text-white flex items-center gap-1"
              >
                <XCircle size={24} /> Close
              </button>
              <img 
                src={selectedDoc} 
                alt="Guide Certificate" 
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
            </div>
          </div>
        )}
            
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};
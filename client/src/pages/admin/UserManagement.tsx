import { useState, useEffect } from 'react';
import { Search, Ban, Trash2, UserCheck, Check, X, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminLayout } from '../../components/admin/AdminLayout';
import api from "../../utils/api";
import { DataTable } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import { ConfirmModal } from '../../components/ConfirmModal';
// import { DataTable } from '../../components/common/DataTable'; // Import the new component

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'guide' | 'user';
  isBlocked: boolean;
  kycStatus: 'none' | 'pending' | 'approved' | 'rejected';
  kycDocument?: string;
  avatarURL?: string;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState<UserData | null>(null);
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
  const [selectedKYCUser, setSelectedKYCUser] = useState<UserData | null>(null);
  const limit = 3;

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/admin/users', {
        params: { page: currentPage, limit, search: searchTerm }
      });
      console.log("data from usermanagement:", data.data.users)
      setUsers(data.data.users);
      setTotalPages(data.data.totalPages);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleBlockClick = (user: UserData) => {
    setUserToBlock(user);
    setIsBlockModalOpen(true);
  };

  const confirmBlock = async () => {
    if (!userToBlock) return;
    try {
      const { id, isBlocked } = userToBlock;
      await api.patch(`/api/admin/users/${id}/block`, { blocked: !isBlocked });
      toast.success(isBlocked ? "User unblocked" : "User blocked");
      setUsers(users.map(u => u.id === id ? { ...u, isBlocked: !isBlocked } : u));
    } catch (error) {
      toast.error("Action failed");
    } finally {
      setIsBlockModalOpen(false);
      setUserToBlock(null);
    }
  };

  const handleVerifyKYC = async (userId: string, status: 'approved' | 'rejected') => {
    try {
      await api.patch(`/api/admin/kyc/${userId}/approve`, { status });
      toast.success(`KYC ${status === 'approved' ? 'Approved' : 'Rejected'}`);
      setUsers(users.map(u => u.id === userId ? { ...u, kycStatus: status } : u));
      setIsKYCModalOpen(false);
    } catch (error) {
      toast.error("Failed to update KYC status");
    }
  };

  const handleDeleteClick = (userId: string) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };
  const confirmDelete = async () => {
    if (!selectedUserId) return;
    try {
      await api.delete(`/api/admin/users/${selectedUserId}`);
      toast.success("User deleted successfully");
      setUsers(users.filter(u => u.id !== selectedUserId));
    } catch (error) {
      toast.error("Deletion failed");
    } finally {
      setIsModalOpen(false);
      setSelectedUserId(null);
    }
  };

  const columns = [
    {
      header: "User",
      key: "name",
      render: (user: UserData) => (
        <div className="flex items-center gap-3">
          {user.avatarURL ? (
            <img
              src={user.avatarURL.startsWith('http') ? user.avatarURL : `${api.defaults.baseURL}/${user.avatarURL}`}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#f0f9ff] flex items-center justify-center text-[#5537ee] font-bold">
              {user.name.charAt(0)}
            </div>
          )}
          <div>
            <div className="font-semibold text-gray-800">{user.name}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      header: "Role",
      key: "role",
      render: (user: UserData) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
          user.role === 'guide' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
          }`}>
          {user.role}
        </span>
      )
    },
    {
      header: "Status",
      key: "isBlocked",
      render: (user: UserData) => (
        <span className={`flex items-center gap-1 text-xs font-bold ${user.isBlocked ? 'text-red-500' : 'text-emerald-500'}`}>
          <span className={`w-2 h-2 rounded-full ${user.isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
          {user.isBlocked ? 'Blocked' : 'Active'}
        </span>
      )
    },
    {
      header: "KYC Status",
      key: "kycStatus",
      render: (user: UserData) => (
        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${user.kycStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' :
          user.kycStatus === 'pending' ? 'bg-amber-100 text-amber-700' :
            user.kycStatus === 'rejected' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
          }`}>
          {user.kycStatus || 'None'}
        </span>
      )
    },
    {
      header: "Documents",
      key: "kycDocument",
      render: (user: UserData) => (
        user.kycStatus !== 'none' ? (
          <button
            onClick={() => { setSelectedKYCUser(user); setIsKYCModalOpen(true); }}
            className="flex items-center gap-1.5 text-xs font-medium text-[#5537ee] hover:underline"
          >
            <FileText size={14} />
            View Document
          </button>
        ) : (
          <span className="text-xs text-gray-400 italic">Not Uploaded</span>
        )
      )
    },
    {
      header: "Block/Unblock",
      key: "actions",
      className: "text-right",
      render: (user: UserData) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleBlockClick(user)}
            className={`p-2 rounded-lg transition ${user.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
            title={user.isBlocked ? "Unblock" : "Block"}
          >
            {user.isBlocked ? <UserCheck size={18} /> : <Ban size={18} />}
          </button>
        </div>
      )
    },
    {
      header: "Actions",
      key: "actions",
      className: "text-right",
      render: (user: UserData) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleDeleteClick(user.id)}
            className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800">User Directory</h2>
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#5537ee]"
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        {/* Reusable Data Table */}
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          emptyMessage="No users found."
        />

        {/* Footer with Pagination */}
        <div className="p-4 border-t">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Yes, Delete"
      />

      <ConfirmModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onConfirm={confirmBlock}
        title={userToBlock?.isBlocked ? "Unblock User" : "Block User"}
        message={`Are you sure you want to ${userToBlock?.isBlocked ? 'unblock' : 'block'} ${userToBlock?.name}?`}
        confirmText={userToBlock?.isBlocked ? "Yes, Unblock" : "Yes, Block"}
        type={userToBlock?.isBlocked ? "info" : "warning"}
      />

      {/* KYC View Modal */}
      {isKYCModalOpen && selectedKYCUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsKYCModalOpen(false)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">KYC Verification</h3>
                <p className="text-sm text-gray-500">Review documents for {selectedKYCUser.name}</p>
              </div>
              <button
                onClick={() => setIsKYCModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto bg-gray-50 flex items-center justify-center">
              {selectedKYCUser.kycDocument ? (
                selectedKYCUser.kycDocument.startsWith('http') ? (
                  selectedKYCUser.kycDocument.endsWith('.pdf') ? (
                    <iframe
                      src={selectedKYCUser.kycDocument}
                      className="w-full h-125 border-0 rounded-lg shadow-sm"
                    />
                  ) : (
                    <img
                      src={selectedKYCUser.kycDocument}
                      alt="KYC Document"
                      className="max-w-full rounded-lg shadow-md"
                    />
                  )
                ) : (
                  selectedKYCUser.kycDocument.endsWith('.pdf') ? (
                    <iframe
                      src={`${api.defaults.baseURL}/${selectedKYCUser.kycDocument}`}
                      className="w-full h-125 border-0 rounded-lg shadow-sm"
                    />
                  ) : (
                    <img
                      src={`${api.defaults.baseURL}/${selectedKYCUser.kycDocument}`}
                      alt="KYC Document"
                      className="max-w-full rounded-lg shadow-md"
                    />
                  )
                )
              ) : (
                <div className="py-20 text-center">
                  <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No document found.</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-white border-t flex gap-3">
              <button
                onClick={() => handleVerifyKYC(selectedKYCUser.id, 'rejected')}
                disabled={selectedKYCUser.kycStatus === 'rejected'}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={18} />
                Reject
              </button>
              <button
                onClick={() => handleVerifyKYC(selectedKYCUser.id, 'approved')}
                disabled={selectedKYCUser.kycStatus === 'approved'}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5537ee] text-white rounded-xl hover:bg-[#4429d1] font-semibold shadow-lg shadow-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={18} />
                Approve & Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
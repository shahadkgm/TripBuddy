import React, { useState, useEffect } from 'react';
import { Search, Ban, Trash2, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminLayout } from '../../components/admin/AdminLayout';
import api from "../../utils/api";
import { Pagination } from '../../components/Pagination';
import { DataTable } from '../../components/DataTable';
// import { DataTable } from '../../components/common/DataTable'; // Import the new component

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'guide' | 'user';
  isBlocked: boolean;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (userId: string, isBlocked: boolean) => {
    try {
      await api.patch(`/api/admin/users/${userId}/block`, { blocked: !isBlocked });
      toast.success(isBlocked ? "User unblocked" : "User blocked");
      setUsers(users.map(u => u._id === userId ? { ...u, isBlocked: !isBlocked } : u));
    } catch (error) {
      toast.error("Action failed");
    }
  };

  // --- Table Column Configuration ---
  const columns = [
    {
      header: "User",
      key: "name",
      render: (user: UserData) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#f0f9ff] flex items-center justify-center text-[#5537ee] font-bold">
            {user.name.charAt(0)}
          </div>
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
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
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
      header: "Actions",
      key: "actions",
      className: "text-right",
      render: (user: UserData) => (
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => handleToggleBlock(user._id, user.isBlocked)}
            className={`p-2 rounded-lg transition ${user.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
            title={user.isBlocked ? "Unblock" : "Block"}
          >
            {user.isBlocked ? <UserCheck size={18} /> : <Ban size={18} />}
          </button>
          <button className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100">
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
    </AdminLayout>
  );
};
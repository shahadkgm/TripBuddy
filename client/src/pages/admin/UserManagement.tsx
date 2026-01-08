 //client/src/pages/admin/UserManagement.tsx
 import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Ban, Trash2, UserCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { authService } from '../../store/authStore';
import api from "../../utils/api"
import { Pagination } from '../../components/Pagination';


interface UserData {
  id: string;
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
  }, [currentPage, searchTerm]); // Refetch when page or search changes

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Pass page, limit, and search to backend
      const { data } = await api.get('/api/admin/users', {
        params: {
          page: currentPage,
          limit,
          search: searchTerm
        }
      });
      
      // Update state based on paginated response
      // Expecting backend to return { users: [], totalPages: x }
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleToggleBlock = async (userId: string, isBlocked: boolean) => {
    try {
        const token=authService.getToken()
      await api.patch(`/api/admin/users/${userId}/block`,
          { blocked: !isBlocked }
        // {headers:{Authorization:`Bearer ${token}`}}
        );
      toast.success(isBlocked ? "User unblocked" : "User blocked");
      // Update local state to reflect change
      setUsers(users.map(u => u.id === userId ? { ...u, isBlocked: !isBlocked } : u));
    } catch (error) {
      toast.error("Action failed");
    }
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };

  return (
    <AdminLayout>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Table Header / Toolbar */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800">User Directory</h2>
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#5537ee]"
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
          ) : (
            <>
              <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">User</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#f0f9ff] flex items-center justify-center text-[#5537ee] font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                      user.role === 'guide' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1 text-xs font-bold ${user.isBlocked ? 'text-red-500' : 'text-emerald-500'}`}>
                      <span className={`w-2 h-2 rounded-full ${user.isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleToggleBlock(user.id, user.isBlocked)}
                        className={`p-2 rounded-lg transition ${user.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                        title={user.isBlocked ? "Unblock" : "Block"}
                      >
                        {user.isBlocked ? <UserCheck size={18} /> : <Ban size={18} />}
                      </button>
                      <button className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && !loading && (
            <div className="p-10 text-center text-gray-400">No users found.</div>
          )}
          <div className="p-4 border-t">
                <Pagination
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={handlePageChange} 
                />
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
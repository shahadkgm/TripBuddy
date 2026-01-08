import { LayoutDashboard } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
// import { AdminLayout } from '../components/AdminLayout';

export const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        
        {/* total Users */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-[#5537ee] hover:shadow-xl transition duration-300">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Users</p>
          <h2 className="text-4xl font-extrabold text-[#1e293b]">1,240</h2>
          <span className="text-xs text-[#5537ee] font-medium mt-1 inline-block">↑ 12% Last Month</span>
        </div>

        {/* active trips */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-[#10b981] hover:shadow-xl transition duration-300">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Active Trips</p>
          <h2 className="text-4xl font-extrabold text-[#1e293b]">300</h2>
          <span className="text-xs text-[#10b981] font-medium mt-1 inline-block">↑ 5% Weekly</span>
        </div>

        {/* Pending Verifications  */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-yellow-500 hover:shadow-xl transition duration-300">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Pending Verifications</p>
          <h2 className="text-4xl font-extrabold text-[#1e293b]">12</h2>
          <span className="text-xs text-yellow-600 font-medium mt-1 inline-block">Review Required</span>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 min-h-300px flex items-center justify-center">
        <div className="text-center">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <LayoutDashboard className="text-slate-300" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Activity Logs</h3>
          <p className="text-slate-500 max-w-xs mx-auto">Welcome to the central command. Use the sidebar to manage your travel community.</p>
        </div>
      </div>
    </AdminLayout>
  );
};
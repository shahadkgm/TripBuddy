import React, { useState } from "react";
import {
  User,
  Star,
  Clock,
  DollarSign,
  Calendar,
  MessageSquare,
  LogOut

} from "lucide-react";
import { authService } from "../../store/authStore";
import { GuideSidebar } from "./GuideSidebar";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
// import { GuideSidebar } from "../../components/guide/GuideSidebar";

export const GuideDashboard = () => {
  const user = authService.getCurrentUser();
  const navigate=useNavigate()
  const [stats] = useState({
    totalBookings: 0,
    rating: 5.0,
    earned: 0,
    status: "Verified"
  });
  const handleLogout = () => {
    authService.logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      {/* Sidebar */}
      <GuideSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Bar */}
        <header className="bg-white px-6 py-4 border-b flex justify-between items-center sticky top-0 z-10">
          <h2 className="font-bold text-lg">Dashboard</h2>
          
          <div className="flex items-center gap-6">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{user?.name}</span>
              <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center">
                <User size={18} />
              </div>
            </div>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors border-l pl-6"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="p-6 lg:p-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-gray-500">
              Here’s what’s happening .
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard icon={<Calendar className="text-blue-600" />} label="Bookings" value={stats.totalBookings} />
            <StatCard icon={<Star className="text-amber-500" />} label="Rating" value={stats.rating} />
            <StatCard icon={<DollarSign className="text-emerald-600" />} label="Earnings" value={`$${stats.earned}`} />
            <StatCard icon={<Clock className="text-purple-600" />} label="Status" value={stats.status} />
          </div>

          {/* Bookings */}
          <div className="bg-white rounded-2xl shadow-sm border p-10 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="text-slate-400" />
            </div>
            <h4 className="font-semibold">No bookings yet</h4>
            <p className="text-sm text-gray-500 mt-1">
              Travelers who book you will appear here.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

const StatCard = ({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => (
  <div className="bg-white p-6 rounded-2xl border shadow-sm flex gap-4">
    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  </div>
);

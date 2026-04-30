import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authService } from '../../services/c.authService';
import {
  LayoutDashboard,
  Users,
  Map,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  CreditCard,
  Bell,
  Search,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    authService.logout();
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/admin/dashboard':
        return 'Dashboard Overview';
      case '/admin/users':
        return 'User Directory';
      case '/admin/guides':
        return 'Expert Guides';
      case '/admin/trips':
        return 'Platform Escapes';
      case '/admin/payments':
        return 'Financial Escrow';
      case '/admin/revenue':
        return 'Revenue Management';
      case '/admin/reports':
        return 'Safety Reports';
      default:
        return 'Control Panel';
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Manage Users', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Manage Guides', path: '/admin/guides', icon: <ShieldCheck size={20} /> },
    { name: 'Manage Trips', path: '/admin/trips', icon: <Map size={20} /> },
    // { name: 'Groups & Chat', path: '#', icon: <MessageSquare size={20} /> },
    // { name: 'Posts', path: '#', icon: <Image size={20} /> },
    { name: 'Payments', path: '/admin/payments', icon: <CreditCard size={20} /> },
    { name: 'Revenue', path: '/admin/revenue', icon: <TrendingUp size={20} /> },
    { name: 'Safety Reports', path: '/admin/reports', icon: <ShieldAlert size={20} /> },
    // { name: 'Settings', path: '#', icon: <Settings size={20} /> },
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen flex font-sans">
      {/* 📌 SIDEBAR */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-65 bg-[#0f172a] border-r border-slate-800 p-6 shadow-xl shadow-slate-900/40 transition-transform duration-300
        lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col
      `}
      >
        <div className="flex items-center justify-between mb-10 pl-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Map className="text-white h-5 w-5" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Trip<span className="text-indigo-400">Admin</span>
            </h2>
          </div>
          <button
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="space-y-1.5 flex-1">
          {menuItems.map(item => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-semibold text-sm ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 translate-x-1'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className={`${isActive ? 'text-indigo-400' : 'text-slate-500'}`}>
                  {item.icon}
                </div>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="mt-8 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 border border-indigo-500/30">
            <span className="text-indigo-400 font-bold">SH</span>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-200 truncate">Shahad</p>
            <p className="text-xs text-slate-500 truncate">Super Admin</p>
          </div>
        </div>
      </aside>

      {/* 📌 MAIN CONTENT */}
      <div className="flex-1 lg:ml-65 min-h-screen flex flex-col max-w-full overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md p-4 lg:py-5 lg:px-8 flex justify-between items-center m-4 lg:m-8 lg:mb-8 rounded-3xl shadow-sm border border-slate-100 sticky top-4 z-40">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-slate-500 hover:text-indigo-600 transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                {getPageTitle()}
              </h1>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest hidden sm:block mt-0.5">
                Admin Control Center
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="hidden md:flex items-center justify-center p-2.5 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer border border-slate-100">
              <Search size={18} strokeWidth={2.5} />
            </div>
            <div className="relative flex items-center justify-center p-2.5 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer border border-slate-100">
              <Bell size={18} strokeWidth={2.5} />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 animate-pulse border-2 border-white"></span>
            </div>

            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2.5 lg:px-5 lg:py-2.5 lg:gap-2.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-full lg:rounded-xl font-bold transition-all shadow-sm group"
            >
              <LogOut
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
                strokeWidth={2.5}
              />
              <span className="hidden lg:block text-sm">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="px-5 lg:px-8 pb-8 flex-1">{children}</main>
      </div>
    </div>
  );
};

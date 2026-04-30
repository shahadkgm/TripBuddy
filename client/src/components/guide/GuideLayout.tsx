import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Wallet,
  User as UserIcon,
  Star,
  LogOut,
  Menu,
  X,
  Plane,
} from 'lucide-react';
import { authService } from '../../services/c.authService';
import { useSocketContext } from '../../hooks/useSocketContext';
import toast from 'react-hot-toast';

interface GuideLayoutProps {
  children: React.ReactNode;
}

const menu = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/guide-dashboard' },
  { name: 'Bookings', icon: CalendarCheck, path: '/guide/bookings' },
  { name: 'Earnings', icon: Wallet, path: '/guide/earnings' },
  { name: 'Profile Edit', icon: UserIcon, path: '/guide/profile' },
  { name: 'Reviews', icon: Star, path: '/guide/reviews' },
];

export const GuideLayout: React.FC<GuideLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = authService.getCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { totalUnread } = useSocketContext();

  const handleLogout = () => {
    authService.logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getPageTitle = () => {
    const current = menu.find(item => location.pathname === item.path);
    return current ? current.name : 'Guide Central';
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-outfit">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        {/* Brand */}
        <div className="px-8 py-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Plane size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase whitespace-nowrap">
                TripBuddy
              </h1>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest -mt-1">
                Guide Professional
              </p>
            </div>
          </div>
          <button
            className="lg:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-8 space-y-2">
          {menu.map(({ name, icon: Icon, path }) => {
            const isBookings = name === 'Bookings';
            return (
              <NavLink
                key={name}
                to={path}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 group
                  ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-4">
                  <Icon
                    size={20}
                    className={
                      location.pathname === path
                        ? 'text-white'
                        : 'group-hover:text-indigo-400 group-hover:scale-110 transition-transform'
                    }
                  />
                  {name}
                </div>
                {isBookings && totalUnread > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">
                    {totalUnread}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 w-full p-6 border-t border-white/5">
          <div className="bg-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <UserIcon size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-500 font-medium">Guide Dashboard</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen transition-all duration-300">
        {/* Unified Header */}
        <header className="bg-white/80 backdrop-blur-md px-6 lg:px-10 py-5 border-b border-slate-100 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-slate-900 tracking-tighter uppercase text-sm">
                Guide Central
              </h2>
              <span className="text-slate-200">/</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {getPageTitle()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-6">
            <div className="hidden sm:flex items-center gap-3 pr-6 border-r border-slate-100">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                  {user?.name}
                </p>
                <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">
                  Verified Expert
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                {user?.avatarURL ? (
                  <img
                    src={user.avatarURL}
                    alt=""
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <UserIcon size={18} />
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="group p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

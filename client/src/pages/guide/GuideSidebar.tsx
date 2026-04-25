import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Wallet, 
  User, 
  Star, 
  Mail, 
  Menu, 
  X,
  LogOut
} from 'lucide-react';
import { authService } from '../../services/c.authService';

const menu = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/guide-dashboard' },
  { name: 'Invitations', icon: Mail, path: '/guide/invitations' },
  { name: 'Bookings', icon: CalendarCheck, path: '/guide/bookings' },
  { name: 'Earnings', icon: Wallet, path: '/guide/earnings' },
  { name: 'Profile Edit', icon: User, path: '/guide/profile' },
  { name: 'Reviews', icon: Star, path: '/guide/reviews' },
];

export const GuideSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile Hamburger */}
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-6 left-6 z-50 p-3 bg-slate-900 text-white rounded-2xl shadow-xl active:scale-95 transition-all"
      >
        <Menu size={20} />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden transition-all duration-500"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed left-0 top-0 h-screen bg-slate-900 text-white z-[70] transition-all duration-500 ease-out
        w-80 lg:w-64 border-r border-white/5
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Container */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white">
              trip<span className="text-indigo-500">buddy</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-1">
              Guide Portal
            </p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-6 space-y-1 mt-4">
          {menu.map(({ name, icon: Icon, path }) => (
            <NavLink
              key={name}
              to={path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all duration-300
                ${isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'}`
              }
            >
              <Icon size={18} className={({ isActive }: any) => isActive ? 'animate-pulse' : ''} />
              {name}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Profile / Logout */}
        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-white/5 bg-slate-900/50 backdrop-blur-md">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-rose-400 hover:bg-rose-500/10 transition-all border border-rose-500/20 group"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

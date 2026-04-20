import React from 'react';
import { User, LogOut } from 'lucide-react';
import { authService } from '../../services/c.authService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface GuideHeaderProps {
  currentPage: string;
}

export const GuideHeader: React.FC<GuideHeaderProps> = ({ currentPage }) => {
  const user = authService.getCurrentUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur-md px-10 py-5 border-b border-slate-100 flex justify-between items-center sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <h2 className="font-black text-slate-900 tracking-tighter uppercase text-sm">
          Guide Central
        </h2>
        <span className="text-slate-200">/</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {currentPage}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 pr-6 border-r border-slate-100">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">
              {user?.name}
            </p>
            <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">
              Verified Expert
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
            <User size={18} />
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
  );
};

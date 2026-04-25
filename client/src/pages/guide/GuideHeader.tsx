import { type FC } from 'react';
import { User, LogOut, Menu } from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { authService } from '../../services/c.authService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface GuideHeaderProps {
  currentPage: string;
  onMenuClick?: () => void;
}

export const GuideHeader: FC<GuideHeaderProps> = ({ currentPage, onMenuClick }) => {
  const user = authService.getCurrentUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur-md px-6 md:px-10 py-5 border-b border-slate-100 flex justify-between items-center sticky top-0 z-30 h-[89px]">
      <div className="flex items-center gap-4 md:gap-6">
        {/* Mobile Menu Button */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2.5 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-200 active:scale-95 transition-all"
        >
          <Menu size={18} />
        </button>

        <Logo size="sm" className="hidden sm:block lg:hidden" />
        
        <div className="flex items-center gap-2">
          <h2 className="font-black text-slate-900 tracking-tighter uppercase text-[10px] md:text-sm">
            Guide Central
          </h2>
          <span className="text-slate-200 hidden sm:inline">/</span>
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:inline">
            {currentPage}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="flex items-center gap-3 pr-4 md:pr-6 border-r border-slate-100">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight truncate max-w-[100px]">
              {user?.name}
            </p>
            <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">
              Expert
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
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

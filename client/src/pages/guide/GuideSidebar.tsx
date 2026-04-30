import { type FC } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Wallet, 
  User, 
  Star, 
  Mail, 
  X
} from 'lucide-react';
import { Logo } from '../../components/common/Logo';

const menu = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/guide-dashboard' },
  { name: 'Invitations', icon: Mail, path: '/guide/invitations' },
  { name: 'Bookings', icon: CalendarCheck, path: '/guide/bookings' },
  { name: 'Earnings', icon: Wallet, path: '/guide/earnings' },
  { name: 'Profile Edit', icon: User, path: '/guide/profile' },
  { name: 'Reviews', icon: Star, path: '/guide/reviews' },
];

interface GuideSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideSidebar: FC<GuideSidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden transition-all duration-500"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed left-0 top-0 h-screen bg-slate-900 text-white z-[70] transition-all duration-500 ease-out
        w-80 lg:w-64 border-r border-white/5
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Container */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between h-[89px]">
          <div>
            <Logo dark size="md" className="mb-0.5" />
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-600">
              Guide Central
            </p>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400"
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
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300
                ${isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-white/10' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'animate-pulse' : ''} />
                  {name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-10 left-0 w-full p-6 text-center">
            <p className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-700">Adventure awaits</p>
        </div>
      </aside>
    </>
  );
};

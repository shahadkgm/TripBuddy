// src/components/home/Navbar.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/c.authService";
import api from "../../utils/api";
import { User, ArrowLeft, MessageCircle } from "lucide-react";
import { useSocketContext } from "../../context/SocketContext";


interface NavbarProps {
  variant?: 'floating' | 'sticky';
  showBack?: boolean;
  backPath?: string;
}

export const Navbar = ({ variant = 'floating', showBack = false, backPath = "/" }: NavbarProps) => {

  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const { totalUnread } = useSocketContext();
  const [kycStatus, setKycStatus] = useState<string>('loading');

  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      const userId = user?.id;
      if (userId) {
        try {
          const res = await api.get(`/api/kyc-status/${userId}`);
          if (isMounted) {
            setKycStatus(res.data.data?.status || 'none');
          }
        } catch (err) {
          if (isMounted) setKycStatus("none");
        }
      } else {
        if (isMounted) setKycStatus("loading");
      }
    };
    checkStatus();
    return () => { isMounted = false; };
  }, [user?.id]);

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  const isFloating = variant === 'floating';

  return (
    <div className={`${isFloating ? 'fixed top-4 lg:top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl' : 'sticky top-0 w-full bg-white border-b border-slate-100'} z-[100] transition-all duration-300`}>
      <nav className={`flex justify-between items-center ${isFloating ? 'px-4 md:px-8 py-3 md:py-4 bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-2xl md:rounded-[2rem]' : 'px-4 md:px-6 py-3'}`}>
        <div className="flex items-center gap-2 md:gap-4">
          {showBack && (
            <button
              onClick={() => navigate(backPath)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="font-black text-xl md:text-2xl cursor-pointer text-indigo-600 tracking-tighter" onClick={() => navigate("/")}>
            TripBuddy
          </div>
        </div>

        <div className="flex gap-2 md:gap-4 items-center">
          {user ? (
            <div className="flex items-center gap-2 md:gap-4">
              {kycStatus !== 'loading' && (
                <div className="hidden sm:block">
                  {kycStatus === 'none' ? (
                    <button
                      onClick={() => navigate("/kyc-verification")}
                      className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] md:text-xs font-semibold hover:bg-amber-100 transition shadow-sm whitespace-nowrap"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                      KYC
                    </button>
                  ) : (
                    <div
                      onClick={() => navigate("/kyc-status")}
                      className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold border shadow-sm transition-all hover:scale-105 whitespace-nowrap ${kycStatus === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                        kycStatus === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                    >
                      {kycStatus === 'approved' && <span>✅ Verified</span>}
                      {kycStatus === 'pending' && <span>⏳ Pending</span>}
                      {kycStatus === 'rejected' && <span>❌ Rejected</span>}
                    </div>
                  )}
                </div>
              )}
              
              <div className="relative cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-all group">
                <MessageCircle 
                  size={20} 
                  className="text-slate-400 group-hover:text-indigo-600 transition-colors" 
                  onClick={() => navigate('/dashboard')} // Or a specific messages page
                />
                {totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
                    {totalUnread}
                  </span>
                )}
              </div>
              
              <div
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 md:px-3 md:py-2 rounded-xl transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition overflow-hidden border border-indigo-100">
                  {user.avatarURL ? (
                    <img src={user.avatarURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <span className="hidden md:block text-gray-600 text-sm font-medium">
                  Hi, <span className="text-indigo-600 font-bold">{user.name.split(' ')[0]}</span>
                </span>
              </div>

              <button onClick={handleLogout} className="text-xs md:text-sm font-bold text-slate-400 hover:text-red-500 transition-colors px-2 py-1">
                Logout
              </button>

            </div>
          ) : (
            <div className="flex gap-2 lg:gap-4">
              <button onClick={() => navigate("/login")} className="text-gray-600 text-sm md:text-base font-medium px-2">Login</button>
              <button onClick={() => navigate("/register")} className="px-4 md:px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm md:text-base font-medium shadow-lg shadow-indigo-100">Sign Up</button>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};
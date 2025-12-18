// src/components/home/Navbar.tsx
import { useNavigate } from "react-router-dom";
import { authService } from "../../../../modules/auth/services/auth.service";

export const Navbar = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  return (
    <nav className="flex justify-between items-center p-6 bg-white shadow-sm sticky top-0 z-50">
      <div className="font-bold text-xl cursor-pointer" onClick={() => navigate("/")}>
        Trip Buddy
      </div>

      <div className="flex gap-4 items-center">
        {user ? (
          <div className="flex items-center gap-4">
            {/* --- KYC ALERT BUTTON --- */}
            {/* In a real app, you'd check user.isVerified === false */}
            <button 
              onClick={() => navigate("/kyc-verification")}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold hover:bg-amber-100 transition shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Complete KYC
            </button>

            {/* --- USER WELCOME --- */}
            <span className="text-gray-600 text-sm font-medium">
              Welcome, <span className="text-[#5537ee]">{user.user.name}</span>
            </span>

            {/* --- LOGOUT --- */}
            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-red-600 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <button onClick={() => navigate("/login")} className="text-gray-600 font-medium">
              Login
            </button>
            <button 
              onClick={() => navigate("/register")}
              className="px-6 py-2 bg-[#5537ee] text-white rounded-xl font-medium"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
// src/components/home/Navbar.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../store/authStore";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const Navbar = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  console.log("full user Object",user)
const [kycStatus, setKycStatus] = useState<string>('loading');

 useEffect(() => {
 let isMounted=true;
const checkStatus = async () => {
const userId = user?.id; 
if (userId) {
 try {
      const res = await axios.get(`${API_URL}/api/kyc-status/${userId}`); 
 if(isMounted){
 setKycStatus(res.data.status);}
 } catch (err) {
 if(isMounted) setKycStatus("none")}
 }
 };
 checkStatus();
return ()=>{isMounted=false;}
 }, [user?.id]);

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
            
            {/* --- CONDITIONAL KYC BUTTON --- */}
           {kycStatus !== 'loading' && (
    <>
      {kycStatus === 'none' ? (
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
      ) : (
        <div 
          onClick={() => navigate("/kyc-status")} 
          className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm transition-all hover:scale-105 ${
            kycStatus === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
            kycStatus === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
            'bg-blue-50 text-blue-700 border-blue-200'
          }`}
        >
         
          {kycStatus === 'approved' && <span>✅ Verified</span>}
          {kycStatus === 'pending' && <span>⏳ Pending Review</span>}
          {kycStatus === 'rejected' && <span>❌ Rejected</span>}
        </div>
      )}
    </>
  )}

  <span className="text-gray-600 text-sm font-medium">
    Welcome, <span className="text-[#5537ee]">{user.name}</span>
  </span>

            <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-red-600 transition">
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <button onClick={() => navigate("/login")} className="text-gray-600 font-medium">Login</button>
            <button onClick={() => navigate("/register")} className="px-6 py-2 bg-[#5537ee] text-white rounded-xl font-medium">Sign Up</button>
          </div>
        )}
      </div>
    </nav>
  );
};
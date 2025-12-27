// src/components/home/Hero.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../../../modules/auth/services/auth.service";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const Hero = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [kycStatus, setKycStatus] = useState<string>('loading');

  useEffect(() => {
    const checkStatus = async () => {
      const userId = user?.user?.id; 
      if (userId) {
        try {
          const res = await axios.get(`${API_URL}/api/kyc-status/${userId}`);
          setKycStatus(res.data.status);
        } catch (err) {
          setKycStatus('none');
        }
      } else {
        setKycStatus('none');
      }
    };
    checkStatus();
  }, [user]);

  const handleStartPlanning = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (kycStatus === 'approved') {
      navigate("/dashboard");
    } else if (kycStatus === 'pending') {
      alert("Verification Pending: You'll be able to plan trips once our team approves your ID.");
      navigate("/kyc-status");
    } else {
      alert("Identification Required: Please complete your KYC to start planning trips.");
      navigate("/kyc-verification");
    }
  };

  return (
    <>
      <button 
        onClick={handleStartPlanning}
        disabled={kycStatus === 'loading' && !!user}
        className="px-8 mt-3 py-4 bg-[#e4e3e8] text-blue-500 rounded-xl font-bold hover:bg-[#442cd4] transition-all shadow-md active:scale-95 disabled:opacity-70"
      >
        {kycStatus === 'loading' && !!user ? "Checking..." : "Start Planning"}
      </button>
      
      {/* Small status indicator below button if not verified */}
      {user && kycStatus !== 'approved' && kycStatus !== 'loading' && (
        <p className="text-[10px] text-amber-600 mt-2 ml-7 uppercase tracking-wider font-bold">
          KYC Required
        </p>
      )}
    </>
  );
};
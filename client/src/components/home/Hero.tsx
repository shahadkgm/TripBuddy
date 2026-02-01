// src/components/home/Hero.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import axios from "axios";
import toast from 'react-hot-toast'; // Added toast but it have problem i want to recheck this 
const API_URL = import.meta.env.VITE_API_URL;

export const Hero = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [kycStatus, setKycStatus] = useState<string>("loading");

  useEffect(() => {
    const checkStatus = async () => {
      const userId = user?.id;

      if (!userId) {
        setKycStatus("none");
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/api/kyc-status/${userId}`);
        console.log("KYC Response in Hero:", res.data);
        setKycStatus(res.data.status);
      } catch (err) {
        console.error("KYC fetch error:", err);
        setKycStatus("none");
        toast.error("Failed to fetch KYC status");
      }
    };

    checkStatus();
  }, [user?.id]);

  const handleStartPlanning = () => {
    const freshUser = authService.getCurrentUser();

    if (!freshUser) {
      toast.error("Please login to start planning");
      navigate("/login");
      return;
    }

    if (kycStatus === "approved") {
      navigate("/dashboard");
      return;
    }

    if (kycStatus === "pending") {
      toast.error("Verification pending. Please wait for approval.");
      navigate("/kyc-status");
      return;
    }

    toast.error("KYC required. Please complete verification.");
    navigate("/kyc-verification");
  };

  return (
    <>
      <button
        onClick={handleStartPlanning}
        disabled={kycStatus === "loading" && !!user}
        className="px-8 mt-3 py-4 bg-[#e4e3e8] text-blue-500 rounded-xl font-bold hover:bg-[#442cd4] transition-all shadow-md active:scale-95 disabled:opacity-70"
      >
        {kycStatus === "loading" && !!user ? "Checking..." : "Start Planning"}
      </button>

      {user && kycStatus !== "approved" && kycStatus !== "loading" && (
        <p className="text-[10px] text-amber-600 mt-2 ml-7 uppercase tracking-wider font-bold">
          KYC Required
        </p>
      )}
    </>
  );
};

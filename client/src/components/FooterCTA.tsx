import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useKycStatus } from '../hooks/useKycStatus';
import { authService } from '../services/c.authService';
import toast from 'react-hot-toast';

export const FooterCTA: React.FC = () => {
  const navigate = useNavigate();
  const { kycStatus, isLoading } = useKycStatus();
  const user = authService.getCurrentUser();

  const handleStartPlanning = () => {
    if (!user) {
      toast.error('Please login to start planning');
      navigate('/login');
      return;
    }

    if (kycStatus === 'approved') {
      navigate('/dashboard');
    } else if (kycStatus === 'pending') {
      toast.error('Verification pending. Please wait for approval.');
      navigate('/kyc-status');
    } else {
      toast.error('KYC required. Please complete verification.');
      navigate('/kyc-verification');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 border-t pt-8">
      <button
        onClick={handleStartPlanning}
        disabled={isLoading && !!user}
        className="w-full md:w-auto px-16 py-4 bg-[#10b981] text-white rounded-2xl font-extrabold text-lg shadow-xl shadow-green-200 hover:bg-green-600 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-70"
      >
        {isLoading && !!user ? 'Checking...' : 'Start Planning Now'}
      </button>
      <p className="text-[11px] text-gray-400 font-semibold tracking-wide uppercase">
        Make every moment of your journey count
      </p>
    </div>
  );
};

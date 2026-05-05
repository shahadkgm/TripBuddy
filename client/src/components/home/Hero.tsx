import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useKycStatus } from '../../hooks/useKycStatus';
import toast from 'react-hot-toast';

export const Hero = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const { kycStatus, isLoading } = useKycStatus();

  const handleStartPlanning = () => {
    const freshUser = authService.getCurrentUser();

    if (!freshUser) {
      toast.error('Please login to start planning');
      navigate('/login');
      return;
    }

    if (kycStatus === 'approved') {
      navigate('/dashboard');
      return;
    }

    if (kycStatus === 'pending') {
      toast.error('Verification pending. Please wait for approval.');
      navigate('/kyc-status');
      return;
    }

    toast.error('KYC required. Please complete verification.');
    navigate('/kyc-verification');
  };

  return (
    <>
      <button
        onClick={handleStartPlanning}
        disabled={isLoading && !!user}
        className="px-8 mt-3 py-4 bg-[#e4e3e8] text-blue-500 rounded-xl font-bold hover:bg-[#442cd4] transition-all shadow-md active:scale-95 disabled:opacity-70"
      >
        {isLoading && !!user ? 'Checking...' : 'Start Planning'}
      </button>

      {user && kycStatus !== 'approved' && !isLoading && (
        <p className="text-[10px] text-amber-600 mt-2 ml-7 uppercase tracking-wider font-bold">
          KYC Required
        </p>
      )}
    </>
  );
};

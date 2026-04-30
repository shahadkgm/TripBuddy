import { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import api from '../utils/api';

export const useKycStatus = () => {
  const [kycStatus, setKycStatus] = useState<'none' | 'pending' | 'approved' | 'rejected' | 'loading'>('loading');
  const user = authService.getCurrentUser();

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user?.id) {
        setKycStatus('none');
        return;
      }

      try {
        const res = await api.get(`/api/kyc-status/${user.id}`);
        const latestStatus = res.data.data?.status || 'none';
        setKycStatus(latestStatus);

        // If the status has changed from what we have locally, update it
        if (latestStatus !== user.kycStatus) {
          const updatedUser = { ...user, kycStatus: latestStatus };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          // Trigger storage event so other components (like Navbar) update
          window.dispatchEvent(new Event('storage'));
        }
      } catch (err) {
        console.error('Failed to fetch KYC status:', err);
        setKycStatus('none');
      }
    };

    fetchStatus();
  }, [user?.id]);

  return { kycStatus, isLoading: kycStatus === 'loading' };
};

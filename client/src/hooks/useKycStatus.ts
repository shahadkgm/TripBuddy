import { useQuery } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import api from '../utils/api';

export const useKycStatus = () => {
  const user = authService.getCurrentUser();

  const { data: kycStatus = 'loading', isLoading } = useQuery({
    queryKey: ['kyc-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return 'none';
      try {
        const res = await api.get(`/api/kyc-status/${user.id}`);
        const latestStatus = res.data.data?.status || 'none';

        // If the status has changed from what we have locally, update it
        if (latestStatus !== user.kycStatus) {
          const updatedUser = { ...user, kycStatus: latestStatus };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          // Trigger storage event so other components (like Navbar) update
          window.dispatchEvent(new Event('storage'));
        }
        return latestStatus;
      } catch (err) {
        console.error('Failed to fetch KYC status:', err);
        return 'none';
      }
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60, // Cache for 1 minute
  });

  // Maintain loading state correctly for first mount
  const finalStatus = isLoading ? 'loading' : kycStatus;

  return { kycStatus: finalStatus, isLoading: finalStatus === 'loading' };
};

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { authService } from '../../services/c.authService';

interface IKYCData {
  status: string;
  documentType?: string;
  uploadedAt?: string | number | Date;
  rejectionReason?: string;
}

const KYCStatusPage = () => {
  const [kycData, setKycData] = useState<IKYCData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  useEffect(() => {
    const fetchKYCDetails = async () => {
      const userId = user?.id; // The ID from your log
      if (userId) {
        try {
          console.log('userId', userId);
          const res = await api.get(`/api/kyc-status/${userId}`);
          console.log('KYC Data from API:', res.data.data);
          setKycData(res.data.data);
        } catch (_err) {
          console.error('Error fetching KYC details:', _err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchKYCDetails();
  }, [user?.id]);

  if (loading)
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  const getStatusStyles = () => {
    switch (kycData?.status) {
      case 'approved':
        return { bg: 'bg-green-100', text: 'text-green-700', icon: '✅', label: 'Verified' };
      case 'rejected':
        return { bg: 'bg-red-100', text: 'text-red-700', icon: '❌', label: 'Rejected' };
      default:
        return { bg: 'bg-blue-100', text: 'text-blue-700', icon: '⏳', label: 'Pending Review' };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Status</h2>
        <p className="text-gray-500 mb-8 text-sm">
          Track the progress of your identity verification.
        </p>

        <div
          className={`${styles.bg} ${styles.text} rounded-2xl p-6 text-center mb-8 border border-opacity-20`}
        >
          <div className="text-4xl mb-2">{styles.icon}</div>
          <div className="text-xl font-bold">{styles.label}</div>
          <div className="text-sm mt-2 opacity-80">
            {kycData?.status === 'pending' && (
              <p>We are reviewing your document. This usually takes 24 hours.</p>
            )}
            {kycData?.status === 'approved' && (
              <p>
                Congratulations! You are now a verified Guide. Please login again to access your
                Guide Dashboard.
              </p>
            )}
            {kycData?.status === 'rejected' && (
              <div className="space-y-2">
                <p>We couldn't verify your document.</p>
                {kycData?.rejectionReason && (
                  <div className="mt-2 p-2 bg-red-200/50 rounded-lg font-medium border border-red-300 text-left">
                    <span className="font-bold">Reason:</span> {kycData.rejectionReason}
                  </div>
                )}
                <p className="mt-2">Please try again after addressing the reason above.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 text-left border-t pt-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Document Type</span>
            <span className="font-medium text-gray-900 capitalize">
              {kycData?.documentType?.replace('_', ' ') || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Submitted On</span>
            <span className="font-medium text-gray-900">
              {kycData?.uploadedAt ? new Date(kycData.uploadedAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>

        {kycData?.status === 'rejected' && (
          <button
            onClick={() => navigate('/kyc-verification')}
            className="w-full mt-8 py-3 bg-[#5537ee] text-white rounded-xl font-semibold hover:shadow-lg transition"
          >
            Try Again
          </button>
        )}
        {/* 
        {kycData?.status === 'approved' && (
          <button
            onClick={() => authService.logout()}
            className="w-full mt-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            Go to Login
          </button>
        )} */}

        <button
          onClick={() => navigate('/')}
          className="w-full mt-4 py-3 text-gray-400 text-sm font-medium hover:text-gray-600"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default KYCStatusPage;

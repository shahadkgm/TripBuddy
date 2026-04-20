import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/c.authService';
import api from '../../utils/api';
import { Button } from '../../components/Button';
import toast from 'react-hot-toast';

const KYCPage = () => {
  const [docType, setDocType] = useState('national_id');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  useEffect(() => {
    const checkExistingStatus = async () => {
      const userId = user?.id;
      if (userId) {
        try {
          const res = await api.get(`/api/kyc-status/${userId}`);
          const status = res.data.data?.status;
          if (status === 'pending' || status === 'approved') {
            navigate('/kyc-status');
          }
        } catch (err) {
          console.error('Error checking status on load');
        } finally {
          setChecking(false);
        }
      } else {
        setChecking(false);
      }
    };
    checkExistingStatus();
  }, [user?.id, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload a document to proceed');
      return;
    }

    const userId = user?.id;
    if (!userId) {
      toast.error('User session not found. Please log in again.');
      return;
    }

    console.log('Submitting KYC:', { userId, documentType: docType, fileName: file.name });

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('documentType', docType);
    formData.append('image', file);

    try {
      const response = await api.post(`/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setProgress(percentCompleted);
        },
      });

      if (response.status === 201) {
        toast.success('KYC submitted successfully 🎉');
        setTimeout(() => navigate('/kyc-status'), 1500);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Error uploading document. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checking)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 font-medium">Checking verification status...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify your identity</h2>
        <p className="text-gray-500 mb-8 text-sm">
          Please upload a clear photo of your government-issued ID to unlock all features.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
            <select
              value={docType}
              onChange={e => setDocType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#5537ee] outline-none"
            >
              <option value="national_id">National ID Card</option>
              <option value="passport">Passport</option>
              <option value="driver_license">Driver's License</option>
            </select>
          </div>

          <div
            className={`relative border-2 border-dashed ${
              error ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-[#5537ee]'
            } rounded-2xl p-8 text-center transition-colors`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isSubmitting}
            />
            <div className="space-y-2">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                  error ? 'bg-red-100' : 'bg-indigo-50'
                }`}
              >
                <svg
                  className={`w-6 h-6 ${error ? 'text-red-500' : 'text-[#5537ee]'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              </div>
              <p className={`text-sm font-medium ${error ? 'text-red-500' : 'text-gray-700'}`}>
                {file ? file.name : error || 'Click to upload or drag and drop'}
              </p>
            </div>
          </div>

          {isSubmitting && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-[#5537ee] h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
              <p className="text-xs text-center mt-2 text-gray-500">{progress}% Uploaded</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full py-4 rounded-xl shadow-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Uploading...' : 'Submit for Verification'}
          </Button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
};

export default KYCPage;

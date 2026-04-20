// frontend/src/modules/auth/pages/ForgotPasswordPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../components/Button';
import api from '../../utils/api';
import { authService } from '../../services/c.authService';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (authService.getCurrentUser()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    const resetToast = toast.loading('Sending verification email...');

    try {
      await api.post('/api/users/forgot-password', { email });

      toast.success('Verification email sent! Check your inbox.', { id: resetToast });
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send email. Try again later.', {
        id: resetToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Reset Password</h2>
        <p className="text-gray-500 text-center mb-8">
          Enter your email and we'll send you a verification link.
        </p>

        <form onSubmit={handleResetRequest} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              className={`w-full px-4 py-3 rounded-xl border ${
                error ? 'border-red-500' : 'border-gray-200'
              } focus:ring-2 focus:ring-[#5537ee] outline-none transition-all`}
              placeholder="name@example.com"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
            />
            {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
          </div>
          <Button type="submit" className="w-full py-3" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Verification'}
          </Button>
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm text-gray-500 hover:text-[#5537ee]"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

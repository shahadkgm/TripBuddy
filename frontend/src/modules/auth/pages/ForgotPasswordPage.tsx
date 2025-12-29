// frontend/src/modules/auth/pages/ForgotPasswordPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../../shared/Button';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const resetToast = toast.loading("Sending verification email...");

    try {
      // Update this endpoint to match your actual backend route
      await axios.post(`${API_URL}/api/users/forgot-password`, { email });
      
      toast.success("Verification email sent! Check your inbox.", { id: resetToast });
      // Optionally redirect to login or a code entry page
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send email. Try again later.", { id: resetToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Reset Password</h2>
        <p className="text-gray-500 text-center mb-8">Enter your email and we'll send you a verification link.</p>
        
        <form onSubmit={handleResetRequest} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#5537ee] outline-none"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full py-3" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Verification"}
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
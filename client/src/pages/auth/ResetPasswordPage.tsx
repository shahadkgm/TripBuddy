import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Button } from '../../components/Button';

const API_URL = import.meta.env.VITE_API_URL;

export const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({ password: '', confirmPassword: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { password: '', confirmPassword: '' };

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const loadToast = toast.loading("Updating password...");

    try {
      await axios.post(`${API_URL}/api/users/reset-password/${token}`, { password });

      toast.success("Password reset successful! Redirecting to login...", { id: loadToast });
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Link expired or invalid", { id: loadToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Create New Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              className={`w-full px-4 py-3 rounded-xl border ${errors.password ? 'border-red-500' : 'border-gray-200'
                } focus:ring-2 focus:ring-[#5537ee] outline-none transition-all`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.password}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              className={`w-full px-4 py-3 rounded-xl border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                } focus:ring-2 focus:ring-[#5537ee] outline-none transition-all`}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
              }}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.confirmPassword}</p>
            )}
          </div>
          <Button type="submit" className="w-full py-3" disabled={isSubmitting}>
            {isSubmitting ? "Resetting..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
};
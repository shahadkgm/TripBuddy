import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

// --- Validation Constants ---
const nameRegex = /^[A-Za-z\s]*$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;
const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
const strengthColors = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#27ae60', '#2c3e50'];

const calculatePasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

const RegisterForm = () => {
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);
  const navigate = useNavigate();

  // Update password strength live
  useEffect(() => {
    setPasswordScore(calculatePasswordStrength(form.password));
  }, [form.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: '', email: '', password: '', confirmPassword: '' };

    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    } else if (form.name.length > 20) {
      newErrors.name = 'Name cannot exceed 20 characters';
      isValid = false;
    } else if (!nameRegex.test(form.name)) {
      newErrors.name = 'Name must contain only alphabets';
      isValid = false;
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (!passwordRegex.test(form.password)) {
      newErrors.password = 'Password must include at least one letter and one number';
      isValid = false;
    } else if (passwordScore < 3) {
      newErrors.password = 'Your password is too weak';
      isValid = false;
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const loadingToast = toast.loading('Creating account...');

    try {
      const { confirmPassword: _confirmPassword, ...registerData } = form;
      await authService.register(registerData);
      toast.success('Verification email sent', { id: loadingToast });
      setIsVerificationSent(true);
    } catch (_error: unknown) {
      const errorObj = _error as { response?: { data?: { message?: string } } };
      const msg = errorObj.response?.data?.message || 'Registration failed';
      toast.error(msg, { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: import("@react-oauth/google").CredentialResponse) => {
    setIsLoading(true);
    try {
      if (!credentialResponse.credential) throw new Error('No credential received');
      await authService.googleLogin(credentialResponse.credential);
      toast.success('Google Login Successful!');
      navigate('/');
    } catch (_error: unknown) {
      const errorObj = _error as { response?: { data?: { message?: string } } };
      const msg = errorObj.response?.data?.message || 'Google Login failed';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerificationSent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 py-8"
      >
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-10 h-10 text-[#5537ee]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Verify your email</h2>
        <p className="text-gray-600">
          We've sent a link to <span className="font-semibold">{form.email}</span>.<br />
          Please click the link to activate your account.
        </p>
        <button
          onClick={() => setIsVerificationSent(false)}
          className="text-[#5537ee] text-sm hover:underline"
        >
          Entered wrong email? Go back
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            name="name"
            type="text"
            placeholder="John Doe"
            value={form.name}
            onChange={handleChange}
            className={`mt-1 w-full px-4 py-2.5 border ${errors.name ? 'border-red-500' : 'border-gray-200'
              } rounded-xl focus:ring-2 focus:ring-[#5537ee] outline-none transition-all`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name}</p>}
        </div>

        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email address</label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            className={`mt-1 w-full px-4 py-2.5 border ${errors.email ? 'border-red-500' : 'border-gray-200'
              } rounded-xl focus:ring-2 focus:ring-[#5537ee] outline-none transition-all`}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>}
        </div>

        {/* Password Input & Strength Meter */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            name="password"
            type="password"
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={handleChange}
            className={`mt-1 w-full px-4 py-2.5 border ${errors.password ? 'border-red-500' : 'border-gray-200'
              } rounded-xl focus:ring-2 focus:ring-[#5537ee] outline-none transition-all`}
          />
          {/* Strength Bar */}
          <div className="mt-2 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(passwordScore / 5) * 100}%` }}
              style={{ backgroundColor: strengthColors[passwordScore] }}
              className="h-full"
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-[10px] font-medium" style={{ color: strengthColors[passwordScore] }}>
              {form.password && strengthLabels[passwordScore]}
            </p>
            {errors.password && (
              <p className="text-xs text-red-500 font-medium">{errors.password}</p>
            )}
          </div>
        </div>

        {/* Confirm Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={form.confirmPassword}
            onChange={handleChange}
            className={`mt-1 w-full px-4 py-2.5 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
              } rounded-xl focus:ring-2 focus:ring-[#5537ee] outline-none transition-all`}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 rounded-xl bg-[#5537ee] text-white font-semibold transition-all shadow-md ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#442cd1] active:scale-95'
            }`}
        >
          {isLoading ? 'Processing...' : 'Sign up'}
        </button>
      </form>

      <div className="relative flex items-center py-2">
        <div className="grow border-t border-gray-200"></div>
        <span className="shrink mx-4 text-gray-400 text-sm italic">or</span>
        <div className="grow border-t border-gray-200"></div>
      </div>

      <div className="w-full flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error('Google Login Failed')}
          useOneTap
          theme="outline"
          shape="pill"
          width="350"
        />
      </div>
    </div>
  );
};

export default RegisterForm;

//client/src/modules/auth/components/LoginForm.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast'; // Added toast but it have problem i want to recheck this 
import { authService } from '../services/c.authService';
import { Button } from './Button'
import { GoogleLogin } from '@react-oauth/google';
;

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '' };

    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    const loginToast = toast.loading("Verifying credentials...");

    try {
      const result = await authService.login({ email, password });
      console.log("result from loginform", result)
      if (result.user.isBlocked) {
        toast.error("Your account has been blocked. Contact support.", { id: loginToast });
        authService.logout();
        return;
      }

      toast.success("Welcome back!", { id: loginToast });
      if (result.user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (result.user.role === "guide") {
        navigate("/guide-dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Invalid email or password.";
      toast.error(errorMessage, { id: loginToast });
    } finally {
      setIsLoading(false);
    }
  };
   const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      await authService.googleLogin(credentialResponse.credential);
      toast.success("Google Login Successful!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Google Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            className={`mt-1 block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:ring-[#5537ee] focus:border-[#5537ee] outline-none transition-colors`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>
          )}
        </div>
        <div>
          <div className="flex justify-between">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-[#5537ee] hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <input
            type="password"
            className={`mt-1 block w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:ring-[#5537ee] focus:border-[#5537ee] outline-none transition-colors`}
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
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Login"}
        </Button>
      </form>
      
      <div className="w-full flex justify-center  h-1.50 mt-6">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error("Google Login Failed")}
          useOneTap
          theme="outline"
          shape="pill"
          width="350"
        />
      </div>
    </div>
  );
};

export default LoginForm;
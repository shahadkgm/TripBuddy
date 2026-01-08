//client/src/modules/auth/components/LoginForm.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import toast from 'react-hot-toast'; // Added toast but it have problem i want to recheck this 
import { authService } from '../store/authStore';
import { Button } from './Button';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  const loginToast = toast.loading("Verifying credentials...");

  try {
    const result = await authService.login({ email, password });
    console.log("result from loginform",result)
    // 🛡️ IMMEDIATE BLOCK CHECK
    if (result.user.isBlocked) {
      toast.error("Your account has been blocked. Contact support.", { id: loginToast });
      authService.logout(); // Clear the storage we just set
      return; 
    }

    toast.success("Welcome back!", { id: loginToast });

    // Unified Redirection
    if (result.user.role === "admin") {
      navigate("/admin/dashboard");
    } else if (result.user.role === "guide") {
      navigate("/guide-dashboard");
    } else {
      navigate("/"); 
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Invalid email or password.";
    toast.error(errorMessage, { id: loginToast });
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input 
            type="email" 
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#5537ee] focus:border-[#5537ee] outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
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
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#5537ee] focus:border-[#5537ee] outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Login"}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
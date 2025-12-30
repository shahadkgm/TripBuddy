// frontend/src/modules/auth/components/LoginForm.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import toast from 'react-hot-toast'; // Added toast but it have problem i want to recheck this 
import { authService } from '../services/auth.service';
import { Button } from '../../../shared/Button';

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
      await authService.login({ email, password });
      toast.success("Welcome back!", { id: loginToast });
      navigate('/'); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid email or password.", { id: loginToast });//not work re check needed
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
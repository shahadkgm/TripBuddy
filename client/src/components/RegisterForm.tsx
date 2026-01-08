import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { authService } from "../store/authStore"; 
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { motion } from "framer-motion";

// --- Validation Constants ---
const nameRegex = /^[A-Za-z\s]*$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;
const strengthLabels = ["Too weak", "Weak", "Fair", "Good", "Strong", "Very Strong"];
const strengthColors = ["#e74c3c", "#e67e22", "#f1c40f", "#2ecc71", "#27ae60", "#2c3e50"];

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
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);
  const navigate = useNavigate();

  // Update password strength live
  useEffect(() => {
    setPasswordScore(calculatePasswordStrength(form.password));
  }, [form.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
      toast.error("All fields are required");
      return false;
    }
    if (form.name.length > 20) {
      toast.error("Name cannot exceed 20 characters");
      return false;
    }
    if (!nameRegex.test(form.name)) {
      toast.error("Name must contain only alphabets");
      return false;
    }
    if (!emailRegex.test(form.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    if (!passwordRegex.test(form.password)) {
      toast.error("Password must include at least one letter and one number");
      return false;
    }
    if (passwordScore < 3) {
      toast.error("Your password is too weak");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const loadingToast = toast.loading("Creating account...");

    try {
      const { confirmPassword, ...registerData } = form;
      await authService.register(registerData);
      toast.success("Registration successful!", { id: loadingToast });
      navigate("/login"); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed", { id: loadingToast });
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
            className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5537ee] outline-none transition-all"
          />
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
            className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5537ee] outline-none transition-all"
          />
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
            className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5537ee] outline-none transition-all"
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
          <p className="text-[10px] mt-1 font-medium" style={{ color: strengthColors[passwordScore] }}>
            {form.password && strengthLabels[passwordScore]}
          </p>
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
            className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5537ee] outline-none transition-all"
          />
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 rounded-xl bg-[#5537ee] text-white font-semibold transition-all shadow-md ${
            isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#442cd1] active:scale-95"
          }`}
        >
          {isLoading ? "Processing..." : "Sign up"}
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

export default RegisterForm;
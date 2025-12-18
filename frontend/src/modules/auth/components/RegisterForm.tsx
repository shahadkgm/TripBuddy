import { useState } from "react";
import { useNavigate } from "react-router-dom"; //
import { authService } from "../services/auth.service"; // Ensure this path is correct

const RegisterForm = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  // 1. Add Loading State to prevent multiple clicks
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 2. Client-side Validation
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setIsLoading(true);

    try {
      // 3. Prepare payload (removing confirmPassword before sending to backend)
      const { confirmPassword, ...registerData } = form;
      
      // 4. Call authService
      await authService.register(registerData);
      
      alert("Registration successful!");
      navigate("/login"); // Redirect to login page after success
    } catch (error: any) {
      // Handle errors from backend (e.g., email already exists)
      alert(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            name="name"
            required
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
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5537ee] outline-none transition-all"
          />
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            required
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5537ee] outline-none transition-all"
          />
        </div>

        {/* Confirm Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            required
            placeholder="Confirm your password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5537ee] outline-none transition-all"
          />
        </div>

        {/* 5. Submit Button with Loading State */}
        <button 
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 rounded-xl bg-[#5537ee] text-white font-semibold transition-colors shadow-md ${
            isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#442cd1]"
          }`}
        >
          {isLoading ? "Creating Account..." : "Sign up"}
        </button>
      </form>

      {/* --- Divider --- */}
      <div className="relative flex items-center py-2">
        <div className="grow border-t border-gray-200"></div>
        <span className="shrink mx-4 text-gray-400 text-sm">or</span>
        <div className="grow border-t border-gray-200"></div>
      </div>

      {/* --- Google Button --- */}
      <button 
        type="button"
        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-xl bg-white text-gray-700 font-medium hover:bg-gray-50 transition-all shadow-sm"
      >
        <img 
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" 
          alt="Google" 
          className="w-5 h-5"
        />
        Continue with Google
      </button>
    </div>
  );
};

export default RegisterForm;
import { useState } from "react";

const RegisterForm = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Register payload:", form);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            name="name"
            placeholder="John Doe"
            value={form.name}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5537ee] outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email address</label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5537ee] outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5537ee] outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Min. 8 characters"
            value={form.confirmPassword}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5537ee] outline-none transition-all"
          />
        </div>

        <button 
          type="submit"
          className="w-full py-3 rounded-xl bg-[#5537ee] text-white font-semibold hover:bg-[#442cd1] transition-colors shadow-md"
        >
          Sign up
        </button>
      </form>

      {/* --- Divider --- */}
      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink mx-4 text-gray-400 text-sm">or</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      {/* --- Google Button --- */}
      <button 
        type="button"
        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-xl bg-white text-gray-700 font-medium hover:bg-gray-50 transition-all shadow-sm"
      >
        <img 
          src="https://fonts.googleapis.com/icon?family=Material+Icons" 
          alt="Google" 
          className="w-5 h-5"
        />
        Continue with Google
      </button>
    </div>
  );
};

export default RegisterForm;
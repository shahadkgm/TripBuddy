import RegisterForm from "../components/RegisterForm";
import LoginForm from "../components/LoginForm";
import { Link } from "react-router-dom";
import type { AuthPageProps } from "../interface/Auth.types";



export default function AuthPage({ mode }: AuthPageProps) {
  const isRegister = mode === 'register';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl">
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
             <div className="bg-[#5537ee] p-3 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21s-8-4-8-10a8 8 0 1116 0c0 6-8 10-8 10z" />
                </svg>
             </div>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900">TripBuddy</h1>
          <p className="text-gray-500 mt-2">
            {isRegister ? "Sign up to start planning" : "Welcome back! Please log in"}
          </p>
        </div>

        {/* Swap forms based on the URL */}
        {isRegister ? <RegisterForm /> : <LoginForm />}

        <div className="mt-6 text-center text-sm text-gray-500">
          {isRegister ? (
            <>Already have an account? <Link to="/login" className="text-[#5537ee] font-semibold hover:underline">Log in</Link></>
          ) : (
            <>Don't have an account? <Link to="/register" className="text-[#5537ee] font-semibold hover:underline">Sign up</Link></>
          )}
        </div>
      </div>
    </div>
  );
}
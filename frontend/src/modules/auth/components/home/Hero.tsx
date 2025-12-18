// src/components/home/Hero.tsx
import { useNavigate } from "react-router-dom";
//import { authService } from "../modules/auth/services/auth.service";
import { authService } from "../../../../modules/auth/services/auth.service"
export const Hero = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleStartPlanning = () => {
    if (user) {
      // If logged in, go to the dashboard
      navigate("/dashboard");
    } else {
      // If not logged in, force them to login first
      navigate("/login");
    }
  };

  return (
    <button 
      onClick={handleStartPlanning}
      className="px-8 py-4 bg-[#5537ee] text-white rounded-xl font-bold"
    >
      Start Planning
    </button>
  );
};
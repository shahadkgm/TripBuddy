// src/components/home/Navbar.tsx
import { useNavigate } from "react-router-dom";
import { Button } from "../../../../shared/Button";

export const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
<svg 
  className="w-8 h-8 text-[#5537ee]" // Added w-8 h-8 to constrain size
  fill="none" 
  stroke="currentColor" 
  viewBox="0 0 24 24"
>              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M10 20.25c0 .352.345.644.78.644h4.44c.436 0 .78-.292.78-.644m-7-3.712V10c0-2.28 1.838-4.125 4.125-4.125S16.25 7.72 16.25 10v6.538m-7.5-6.538H9.5a1.25 1.25 0 011.25 1.25v2.5a1.25 1.25 0 01-1.25 1.25H8.75m7.5-5H14a1.25 1.25 0 00-1.25 1.25v2.5a1.25 1.25 0 001.25 1.25h1.25" />
            </svg>
            <span className="text-xl font-bold text-slate-800">TripBuddy</span>
          </div>

          <div className="flex items-center gap-3">
            {/* NEW ALERT BUTTON */}
            <Button variant="alert" size="sm" onClick={() => alert("No new notifications!")}>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.405L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Alerts
            </Button>

            <Button onClick={() => navigate("/login")}>
              Start Planning
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
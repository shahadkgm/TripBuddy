//import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Users, MessageSquare, Wallet, 
  Users2, Image, MapPin, LifeBuoy, 
  UserCircle, Search, UserCheck, X 
} from 'lucide-react';

const DASHBOARD_FEATURES = [
  { 
    title: "Create a Trip Plan", 
    desc: "Organize flights, hotels, and activities in one place.", 
    icon: <Calendar className="w-5 h-5 text-indigo-600" />, 
    color: "bg-indigo-50",
    path: "/create-trip"
  },
  { 
    title: "Find Travelers", 
    desc: "Connect with others on similar travel paths.", 
    icon: <Users className="w-5 h-5 text-blue-600" />, 
    color: "bg-blue-50",
    path: "/find-travelers"
  },
  { 
    title: "Chat with Travelers", 
    desc: "Coordinate plans instantly with messaging.", 
    icon: <MessageSquare className="w-5 h-5 text-purple-600" />, 
    color: "bg-purple-50",
    path: "/chat"
  },
  { 
    title: "Add Group Expenses", 
    desc: "Track who paid what for shared costs.", 
    icon: <Wallet className="w-5 h-5 text-emerald-600" />, 
    color: "bg-emerald-50",
    path: "/expenses"
  },
  { 
    title: "Groups", 
    desc: "Manage your trip groups", 
    icon: <Users2 className="w-5 h-5 text-pink-600" />, 
    color: "bg-pink-50",
    path: "/groups"
  },
  { 
    title: "TRIP GALLERY", 
    desc: "View and share trip photos", 
    icon: <Image className="w-5 h-5 text-blue-600" />, 
    color: "bg-blue-50",
    path: "/gallery"
  },
  { 
    title: "NearByPlace", 
    desc: "Explore local spots around you", 
    icon: <MapPin className="w-5 h-5 text-orange-600" />, 
    color: "bg-orange-50",
    path: "/nearby"
  },
  { 
    title: "Travel Assistance", 
    desc: "Get 24/7 help on the go", 
    icon: <LifeBuoy className="w-5 h-5 text-cyan-600" />, 
    color: "bg-cyan-50",
    path: "/support"
  },
  { 
    title: "Profile", 
    desc: "View and edit your profile", 
    icon: <UserCircle className="w-5 h-5 text-violet-600" />, 
    color: "bg-violet-50",
    path: "/profile"
  },
  { 
    title: "Find Local Experts", 
    desc: "Connect with local guides", 
    icon: <Search className="w-5 h-5 text-amber-600" />, 
    color: "bg-amber-50",
    path: "/find-guide"
  },
  { 
    title: "Join as a guide", 
    desc: "Start earning by guiding", 
    icon: <UserCheck className="w-5 h-5 text-rose-600" />, 
    color: "bg-rose-50",
    path: "/join-guide"
  },
];

const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-8">
      {/* Main Container */}
      <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden relative p-8 md:p-12 border border-white/20">
        
        {/* Close Button */}
        <button 
          onClick={() => navigate('/')}
          className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-extrabold text-indigo-700 mb-2">Unlock Your Adventure</h1>
          <p className="text-gray-500 text-sm md:text-base max-w-lg leading-relaxed">
            Trip Buddy handles everything, so you can focus on making memories. Choose a feature to get started:
          </p>
        </div>

        {/* Interactive Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {DASHBOARD_FEATURES.map((item, index) => (
            <button
              key={index} 
              onClick={() => navigate(item.path)}
              className="flex items-center gap-4 p-4 rounded-2xl transition-all text-left hover:bg-gray-50 active:scale-[0.98] border border-transparent hover:border-gray-100 group w-full"
            >
              <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center transition-all group-hover:rotate-6 group-hover:shadow-inner`}>
                {item.icon}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-800 text-[15px]">{item.title}</span>
                <span className="text-xs text-gray-400 font-medium">{item.desc}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom Action */}
        <div className="flex flex-col items-center gap-4 border-t pt-8">
          <button 
            onClick={() => navigate('/create-trip')}
            className="w-full md:w-auto px-16 py-4 bg-[#10b981] text-white rounded-2xl font-extrabold text-lg shadow-xl shadow-green-200 hover:bg-green-600 hover:-translate-y-1 transition-all active:scale-95"
          >
            Start Planning Now
          </button>
          <p className="text-[11px] text-gray-400 font-semibold tracking-wide uppercase">
            Make every moment of your journey count
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
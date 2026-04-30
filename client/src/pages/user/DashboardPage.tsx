import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FooterCTA } from '../../components/FooterCTA';
import { authService } from '../../services/auth.service';
import { useKycStatus } from '../../hooks/useKycStatus';
import { Calendar, Users, MapPin, UserCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';

const DASHBOARD_FEATURES = [
  {
    title: 'Create a Trip Plan',
    desc: 'Organize flights, hotels, and activities in one place.',
    icon: <Calendar className="w-5 h-5 text-indigo-600" />,
    color: 'bg-indigo-50',
    path: '/create-trip',
    requireKyc: true,
  },
  {
    title: 'Find Trips',
    desc: 'Explore and join upcoming journeys.',
    icon: <Users className="w-5 h-5 text-blue-600" />,
    color: 'bg-blue-50',
    path: '/find-travelers',
    requireKyc: true,
  },
  {
    title: 'NearByPlace',
    desc: 'Explore local spots around you',
    icon: <MapPin className="w-5 h-5 text-orange-600" />,
    color: 'bg-orange-50',
    path: '/nearby',
    requireKyc: false,
  },
  {
    title: 'Join as a guide',
    desc: 'Start earning by guiding',
    icon: <UserCheck className="w-5 h-5 text-rose-600" />,
    color: 'bg-rose-50',
    path: '/join-guide',
    requireKyc: false,
  },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const { kycStatus, isLoading } = useKycStatus();

  useEffect(() => {
    if (user?.role === 'guide') {
      navigate('/guide-dashboard', { replace: true });
    } else if (user?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user?.role, navigate]);

  const handleNavigate = (path: string, requireKyc: boolean) => {
    if (requireKyc && kycStatus !== 'approved') {
      if (kycStatus === 'pending') {
        toast.error('Verification pending. Please wait for approval.');
        navigate('/kyc-status');
      } else {
        toast.error('KYC required. Please complete verification.');
        navigate('/kyc-verification');
      }
      return;
    }
    navigate(path);
  };

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
            Trip Buddy handles everything, so you can focus on making memories. Choose a feature to
            get started:
          </p>
        </div>

        {/* Interactive Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {DASHBOARD_FEATURES.map((item, index) => (
            <button
              key={index}
              onClick={() => handleNavigate(item.path, !!item.requireKyc)}
              disabled={isLoading && !!user && item.requireKyc}
              className="flex items-center gap-4 p-4 rounded-2xl transition-all text-left hover:bg-gray-50 active:scale-[0.98] border border-transparent hover:border-gray-100 group w-full disabled:opacity-70"
            >
              <div
                className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center transition-all group-hover:rotate-6 group-hover:shadow-inner`}
              >
                {item.icon}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-800 text-[15px]">
                  {isLoading && !!user && item.requireKyc ? 'Checking...' : item.title}
                </span>
                <span className="text-xs text-gray-400 font-medium">{item.desc}</span>
              </div>
            </button>
          ))}
        </div>

        <FooterCTA />
      </div>
    </div>
  );
};

export default DashboardPage;

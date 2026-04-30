import { useState } from 'react';
import {
  ArrowLeft,
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudLightning,
  CloudFog,
  CloudDrizzle,
  Navigation,
  Wind,
  Droplets,
  Thermometer,
  Loader2,
  MapPin,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { weatherService } from '../../services/weather.service';
import type { WeatherData } from '../../services/weather.service';
import toast from 'react-hot-toast';

export const WeatherPage = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!city.trim()) return toast.error('Please enter a city name');

    try {
      setLoading(true);
      const data = await weatherService.getWeather(city);
      setWeather(data);
    } catch (_error) {
      toast.error('City not found. Try another location.');
    } finally {
      setLoading(false);
    }
  };

  const renderIcon = (iconName: string) => {
    const props = {
      className: 'w-16 h-16 transition-transform duration-700 group-hover:scale-110',
      strokeWidth: 1.5,
    };
    switch (iconName) {
      case 'Sun':
        return <Sun {...props} className={`${props.className} text-amber-400`} />;
      case 'Cloud':
        return <Cloud {...props} className={`${props.className} text-slate-400`} />;
      case 'CloudSun':
        return <CloudSun {...props} className={`${props.className} text-indigo-400`} />;
      case 'CloudRain':
        return <CloudRain {...props} className={`${props.className} text-blue-400`} />;
      case 'CloudLightning':
        return <CloudLightning {...props} className={`${props.className} text-indigo-600`} />;
      case 'CloudFog':
        return <CloudFog {...props} className={`${props.className} text-slate-300`} />;
      case 'CloudDrizzle':
        return <CloudDrizzle {...props} className={`${props.className} text-blue-300`} />;
      default:
        return <Sun {...props} className={`${props.className} text-amber-400`} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-outfit">
      {/* Header Area */}
      <div className="max-w-7xl mx-auto w-full px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200 group-hover:rotate-12 transition-transform">
            <Navigation className="text-white w-5 h-5 rotate-45" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tighter">Trip Buddy</span>
        </div>
        <button
          onClick={() => navigate('/create-trip')}
          className="bg-white text-slate-600 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-100 flex items-center gap-2 text-sm active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 flex flex-col items-center">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-slate-900 mb-3 tracking-tighter">
            Weather Forecast
          </h1>
          <p className="text-slate-400 font-medium">Plan your travel according to the skies.</p>
        </div>

        {/* Search Bar - Custom Trip Buddy Style */}
        <form
          onSubmit={handleSearch}
          className="w-full max-w-2xl flex flex-col md:flex-row gap-3 mb-16"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Where are you heading?"
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-xl shadow-slate-200/50 text-slate-700 font-medium"
              value={city}
              onChange={e => setCity(e.target.value)}
            />
            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500 w-6 h-6" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check Skies'}
          </button>
        </form>

        {/* Weather Display - Imagine: Blue Glass on Hover */}
        {weather && (
          <div className="w-full max-w-3xl group relative">
            {/* The Animated "Glow" behind the card */}
            <div className="absolute inset-0 bg-indigo-500 rounded-[3rem] blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-700"></div>

            <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-2xl relative overflow-hidden transition-all duration-500 group-hover:-translate-y-2 group-hover:border-indigo-200">
              {/* Glass Background Decor */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:bg-indigo-500/10 transition-colors"></div>

              <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
                  <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
                      {weather.city}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        {weather.date}
                      </p>
                    </div>
                  </div>
                  <div className="bg-slate-900 text-white px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-900/20 group-hover:bg-indigo-600 transition-colors">
                    Live Forecast
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                  <div className="flex items-center gap-8">
                    <div className="p-8 bg-slate-50 rounded-[2.5rem] shadow-inner border border-slate-100/50">
                      {renderIcon(weather.icon)}
                    </div>
                    <div>
                      <div className="flex items-start">
                        <span className="text-8xl font-black text-slate-900 tracking-tighter leading-none">
                          {weather.temp}
                        </span>
                        <span className="text-3xl font-black text-indigo-600 ml-1">°</span>
                      </div>
                      <p className="text-slate-400 font-bold text-xl capitalize mt-2">
                        {weather.condition}
                      </p>
                    </div>
                  </div>

                  {/* Vertical Stats Column */}
                  <div className="flex flex-row lg:flex-col gap-4 w-full lg:w-48">
                    <div className="flex-1 bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100/50 group/item hover:bg-indigo-600 transition-all duration-300">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 group-hover/item:text-indigo-200">
                        UV Index
                      </p>
                      <p className="text-2xl font-black text-indigo-700 group-hover/item:text-white">
                        {weather.uvIndex}
                      </p>
                    </div>
                    <div className="flex-1 bg-slate-50 p-5 rounded-3xl border border-slate-100 group/item hover:bg-slate-900 transition-all duration-300">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover/item:text-slate-500">
                        Humidity
                      </p>
                      <p className="text-2xl font-black text-slate-800 group-hover/item:text-white">
                        {weather.humidity}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Detailed Grid */}
                <div className="mt-12 pt-10 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6">
                  <StatBox
                    icon={<Thermometer size={14} />}
                    label="Feels Like"
                    value={`${weather.feelsLike}°`}
                    color="hover:text-indigo-600"
                  />
                  <StatBox
                    icon={<Wind size={14} />}
                    label="Wind"
                    value={`${weather.windSpeed} km/h`}
                    color="hover:text-blue-500"
                  />
                  <StatBox
                    icon={<Droplets size={14} />}
                    label="Min Temp"
                    value={`${weather.minTemp}°`}
                    color="hover:text-cyan-500"
                  />
                  <StatBox
                    icon={<Sun size={14} />}
                    label="Max Temp"
                    value={`${weather.maxTemp}°`}
                    color="hover:text-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {!weather && !loading && (
          <div className="text-center py-24 flex flex-col items-center gap-6 animate-pulse">
            <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
              <CloudSun size={60} className="text-slate-300" />
            </div>
            <div>
              <p className="font-black text-xl text-slate-300 uppercase tracking-widest">
                Sky Scan Inactive
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Enter a destination to view local weather.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Reusable Sub-component for clean code
const StatBox = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) => (
  <div
    className={`p-5 bg-white border border-slate-100 rounded-[2rem] text-center transition-all hover:shadow-xl hover:shadow-slate-200/50 cursor-default group/stat ${color}`}
  >
    <div className="flex items-center justify-center gap-2 mb-2">
      <span className="text-slate-300 group-hover/stat:text-current transition-colors">{icon}</span>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
    <p className="text-lg font-black text-slate-900 group-hover/stat:scale-110 transition-transform">
      {value}
    </p>
  </div>
);

export default WeatherPage;

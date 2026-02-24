import { useState } from 'react';
import { Search, ArrowLeft, Sun, Cloud, CloudSun, CloudRain, CloudLightning, CloudFog, CloudDrizzle, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { weatherService } from '../../services/weather.service';
import type { WeatherData } from '../../services/weather.service';
import { MainFooter } from '../../components/MainFooter';
import toast from 'react-hot-toast';

export const WeatherPage = () => {
    const navigate = useNavigate();
    const [city, setCity] = useState('');
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!city.trim()) return toast.error("Please enter a city name");

        try {
            setLoading(true);
            const data = await weatherService.getWeather(city);
            setWeather(data);
        } catch (error) {
            toast.error("City not found. Try another location.");
        } finally {
            setLoading(false);
        }
    };

    const renderIcon = (iconName: string) => {
        const props = { className: "w-16 h-16 text-amber-500", strokeWidth: 1.5 };
        switch (iconName) {
            case 'Sun': return <Sun {...props} />;
            case 'Cloud': return <Cloud {...props} className="w-16 h-16 text-slate-400" />;
            case 'CloudSun': return <CloudSun {...props} />;
            case 'CloudRain': return <CloudRain {...props} className="w-16 h-16 text-blue-400" />;
            case 'CloudLightning': return <CloudLightning {...props} className="w-16 h-16 text-indigo-500" />;
            case 'CloudFog': return <CloudFog {...props} className="w-16 h-16 text-slate-300" />;
            case 'CloudDrizzle': return <CloudDrizzle {...props} className="w-16 h-16 text-blue-300" />;
            default: return <Sun {...props} />;
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-outfit">
            {/* Header Area */}
            <div className="max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <Navigation className="text-white w-5 h-5 rotate-45" />
                    </div>
                    <span className="text-2xl font-black text-slate-800 tracking-tight">Trip Buddy</span>
                </div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 flex items-center gap-2 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
            </div>

            <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 flex flex-col items-center">
                <h1 className="text-4xl md:text-5xl font-black text-indigo-600 mb-12 text-center tracking-tight">Weather Forecast</h1>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="w-full max-w-2xl flex gap-3 mb-16">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Enter city or location..."
                            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm text-slate-700"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:opacity-50"
                    >
                        {loading ? "Searching..." : "Search"}
                    </button>
                </form>

                {/* Weather Display */}
                {weather && (
                    <div className="w-full max-w-2xl bg-white rounded-[40px] p-10 border border-slate-100 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-500">
                        <div className="relative z-10">
                            <div className="mb-8">
                                <h2 className="text-3xl font-black text-slate-800">{weather.city}</h2>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">{weather.date}</p>
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-8 justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="bg-slate-50 p-6 rounded-[32px] shadow-inner">
                                        {renderIcon(weather.icon)}
                                    </div>
                                    <div>
                                        <div className="flex items-start">
                                            <span className="text-7xl font-black text-slate-800 tracking-tighter">{weather.temp}</span>
                                            <span className="text-3xl font-black text-indigo-600 mt-2">°C</span>
                                        </div>
                                        <p className="text-slate-500 font-bold tracking-tight text-lg capitalize">{weather.description}</p>
                                    </div>
                                </div>

                                <div className="w-full md:w-auto grid grid-cols-2 md:flex md:flex-col gap-4">
                                    <div className="bg-indigo-50/50 px-6 py-4 rounded-2xl border border-indigo-100/50 flex flex-col items-center">
                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">UV Index</span>
                                        <span className="text-2xl font-black text-indigo-600">{weather.uvIndex}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!weather && !loading && (
                    <div className="text-center py-20 opacity-30 flex flex-col items-center gap-4">
                        <CloudSun size={100} className="text-slate-300" />
                        <p className="font-bold text-xl text-slate-400">Search for a city to see the forecast</p>
                    </div>
                )}


            </main>

            <MainFooter />
        </div>
    );
};

export default WeatherPage;

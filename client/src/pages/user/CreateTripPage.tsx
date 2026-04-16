import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import {
    MapPin, Calendar, User, IndianRupee,
    Briefcase, Hotel, Plane, CheckCircle, FileText, X, Loader2, CloudSun,
    Plus, Search, Thermometer, Wind, Droplets, Sun, Cloud, CloudRain, CloudLightning, CloudFog, CloudDrizzle
} from 'lucide-react';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

import api from '../../utils/api';
import { authService } from '../../services/c.authService';
import { tripService } from '../../services/c.trip.service';
import { nearbyService } from '../../services/c.nearby.service';
import { weatherService, type WeatherData } from '../../services/c.weather.service';

interface NominatimSuggestion {
    display_name: string;
    lat: string;
    lon: string;
    address?: {
        city?: string;
        state?: string;
        country?: string;
    };
}

const INITIAL_INTERESTS = [
    "Beaches", "Adventure Sports", "Shopping", "City Tours",
    "History/Culture", "Nightlife", "Nature/Parks", "Food & Dining"
];

const CreateTripPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;
    const user = authService.getCurrentUser();

    const [formData, setFormData] = useState({
        title: '',
        destination: '',
        travelers: 1,
        startDate: '',
        endDate: '',
        accommodation: 'hotel',
        budget: '',
        transport: 'flight',
        notes: '',
        interests: [] as string[],
    });

    const [allInterests, setAllInterests] = useState(INITIAL_INTERESTS);
    const [newInterestText, setNewInterestText] = useState('');
    const [isAddingInterest, setIsAddingInterest] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(isEditing);
    const [showSuccess, setShowSuccess] = useState(false);

    // Weather States
    const [showWeatherModal, setShowWeatherModal] = useState(false);
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [isWeatherLoading, setIsWeatherLoading] = useState(false);

    // Destination Suggestions
    const [suggestions, setSuggestions] = useState<NominatimSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearchingLoading, setIsSearchingLoading] = useState(false);

    // Map States
    const [showMapModal, setShowMapModal] = useState(false);
    const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
    const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
    const [mapSearchQuery, setMapSearchQuery] = useState('');
    const [mapSuggestions, setMapSuggestions] = useState<NominatimSuggestion[]>([]);
    const [isMapSearching, setIsMapSearching] = useState(false);

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isEditing && id) {
            const fetchTrip = async () => {
                try {
                    setIsLoadingData(true);
                    const trip = await tripService.getTripById(id);
                    setFormData({
                        title: trip.title,
                        destination: trip.destination,
                        travelers: trip.preferences?.travelers || 1,
                        startDate: new Date(trip.startDate).toISOString().split('T')[0],
                        endDate: new Date(trip.endDate).toISOString().split('T')[0],
                        accommodation: trip.preferences?.accommodation || 'hotel',
                        budget: String(trip.budget || ''),
                        transport: trip.preferences?.transport || 'flight',
                        notes: trip.description || '',
                        interests: trip.preferences?.interests || [],
                    });

                    // Add any dynamic interests from the trip if they're not in the initial list
                    if (trip.preferences?.interests) {
                        setAllInterests(prev => {
                            const newItems = trip.preferences.interests.filter((i: string) => !prev.includes(i));
                            return [...prev, ...newItems];
                        });
                    }
                } catch (error) {
                    console.error("Failed to fetch trip", error);
                    toast.error("Failed to load trip details");
                    navigate('/profile');
                } finally {
                    setIsLoadingData(false);
                }
            };
            fetchTrip();
        }
    }, [id, isEditing, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrs = { ...prev };
                delete newErrs[name];
                return newErrs;
            });
        }
    };

    const handleShowWeather = async () => {
        if (!formData.destination.trim()) {
            toast.error("Please enter a destination first");
            return;
        }

        try {
            setIsWeatherLoading(true);
            setShowWeatherModal(true);
            const data = await weatherService.getWeather(formData.destination);
            setWeatherData(data);
        } catch (error) {
            toast.error("Could not find weather for this location.");
            setShowWeatherModal(false);
        } finally {
            setIsWeatherLoading(false);
        }
    };

    const handleAddInterest = () => {
        if (!newInterestText.trim()) return;

        const trimmed = newInterestText.trim();
        if (!allInterests.includes(trimmed)) {
            setAllInterests(prev => [...prev, trimmed]);
        }

        if (!formData.interests.includes(trimmed)) {
            setFormData(prev => ({
                ...prev,
                interests: [...prev.interests, trimmed]
            }));
        }

        setNewInterestText('');
        setIsAddingInterest(false);
    };

    const fetchSuggestions = async (query: string) => {
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }
        setIsSearchingLoading(true);
        try {
            const data = await nearbyService.getSuggestions(query);
            setSuggestions(data);
            setShowSuggestions(true);
        } catch (error) {
            console.error("Error fetching suggestions:", error);
        } finally {
            setIsSearchingLoading(false);
        }
    };

    // Debounce suggestions
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (formData.destination && formData.destination.length >= 3 && !showWeatherModal) {
                // Check if the current destination is already one of our suggestions to avoid infinite loops
                // or just fetch if it's changing
                fetchSuggestions(formData.destination);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 800);
        return () => clearTimeout(timeoutId);
    }, [formData.destination, showWeatherModal]);

    const handleSelectSuggestion = (suggestion: NominatimSuggestion) => {
        setFormData(prev => ({ ...prev, destination: suggestion.display_name }));
        setShowSuggestions(false);
        setSuggestions([]);
        if (suggestion.lat && suggestion.lon) {
            setMapPosition([parseFloat(suggestion.lat), parseFloat(suggestion.lon)]);
        }
    };

    const handleMapClick = async (lat: number, lon: number) => {
        setMapPosition([lat, lon]);
        setIsReverseGeocoding(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const data = await response.json();
            if (data.display_name) {
                setFormData(prev => ({ ...prev, destination: data.display_name }));
                setMapSearchQuery(data.display_name);
            }
        } catch (error) {
            console.error("Reverse geocoding error:", error);
        } finally {
            setIsReverseGeocoding(false);
        }
    };

    const searchOnMap = async (query: string) => {
        if (!query || query.length < 3) return;
        setIsMapSearching(true);
        try {
            const data = await nearbyService.getSuggestions(query);
            setMapSuggestions(data as any);
        } catch (error) {
            console.error("Map search error:", error);
        } finally {
            setIsMapSearching(false);
        }
    };

    const handleSelectMapSuggestion = (suggestion: NominatimSuggestion) => {
        const lat = parseFloat(suggestion.lat);
        const lon = parseFloat(suggestion.lon);
        setMapPosition([lat, lon]);
        setFormData(prev => ({ ...prev, destination: suggestion.display_name }));
        setMapSearchQuery(suggestion.display_name);
        setMapSuggestions([]);
    };

    const MapEvents = () => {
        useMapEvents({
            click(e) { handleMapClick(e.latlng.lat, e.latlng.lng); }
        });
        return null;
    };

    const ChangeView = ({ center }: { center: [number, number] }) => {
        const map = useMap();
        map.setView(center, map.getZoom());
        return null;
    };

    const validateTripData = () => {
        const newErrors: Record<string, string> = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = formData.startDate ? new Date(formData.startDate) : null;
        const end = formData.endDate ? new Date(formData.endDate) : null;

        if (!formData.title) newErrors.title = "Title is required";
        if (!formData.destination) newErrors.destination = "Destination is required";
        if (!start) newErrors.startDate = "Start date is required";
        if (!end) newErrors.endDate = "End date is required";
        else if (start && end < start) newErrors.endDate = "End date cannot be before start date";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInterestChange = (interest: string) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateTripData()) return;

        const userId = user?.id;
        if (!userId) {
            toast.error("You must be logged in to create a trip.");
            return;
        }

        setIsSubmitting(true);
        try {
            const body: any = {
                userId,
                title: formData.title,
                destination: formData.destination,
                startDate: formData.startDate,
                endDate: formData.endDate,
                budget: Number(formData.budget),
                description: formData.notes,
                preferences: {
                    travelers: Number(formData.travelers),
                    accommodation: formData.accommodation,
                    transport: formData.transport,
                    interests: formData.interests
                }
            };

            if (isEditing && id) {
                await tripService.updateTrip(id, body);
                toast.success("Trip updated successfully!");
                navigate('/find-travelers'); // Updated navigation
            } else {
                const response = await api.post('/api/plantrips', body);
                if (response.status === 201) {
                    setShowSuccess(true);
                    setTimeout(() => {
                        navigate('/find-travelers'); // Updated navigation
                    }, 2000);
                }
            }
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to save trip.";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderWeatherIcon = (iconName: string) => {
        const iconProps = { className: "w-12 h-12 text-indigo-500", strokeWidth: 2 };
        switch (iconName) {
            case 'Sun': return <Sun {...iconProps} className="text-amber-400" />;
            case 'Cloud': return <Cloud {...iconProps} className="text-slate-400" />;
            case 'CloudSun': return <CloudSun {...iconProps} className="text-indigo-400" />;
            case 'CloudRain': return <CloudRain {...iconProps} className="text-blue-400" />;
            case 'CloudLightning': return <CloudLightning {...iconProps} className="text-indigo-600" />;
            case 'CloudFog': return <CloudFog {...iconProps} className="text-slate-300" />;
            case 'CloudDrizzle': return <CloudDrizzle {...iconProps} className="text-blue-300" />;
            default: return <Sun {...iconProps} />;
        }
    };

    if (isLoadingData) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-outfit">

            {/* Weather Modal */}
            {showWeatherModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white max-w-lg w-full rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in duration-300">
                        <button
                            onClick={() => setShowWeatherModal(false)}
                            className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-10"
                        >
                            <X size={20} className="text-slate-500" />
                        </button>

                        <div className="p-10">
                            {isWeatherLoading ? (
                                <div className="py-20 flex flex-col items-center gap-4">
                                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                                    <p className="text-slate-400 font-bold animate-pulse">Checking the skies over {formData.destination}...</p>
                                </div>
                            ) : weatherData ? (
                                <div>
                                    <div className="mb-8">
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{weatherData.city}</h2>
                                        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">{weatherData.date}</p>
                                    </div>

                                    <div className="flex items-center gap-8 mb-10 pb-10 border-b border-slate-100">
                                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                            {renderWeatherIcon(weatherData.icon)}
                                        </div>
                                        <div>
                                            <div className="flex items-start">
                                                <span className="text-6xl font-black text-slate-900 tracking-tighter leading-none">{weatherData.temp}</span>
                                                <span className="text-2xl font-black text-indigo-600 ml-1">°</span>
                                            </div>
                                            <p className="text-slate-400 font-bold capitalize mt-1">{weatherData.description}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Wind size={14} className="text-indigo-400" />
                                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Wind Speed</p>
                                            </div>
                                            <p className="text-xl font-black text-indigo-700">{weatherData.windSpeed} km/h</p>
                                        </div>
                                        <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Thermometer size={14} className="text-amber-500" />
                                                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Feels Like</p>
                                            </div>
                                            <p className="text-xl font-black text-amber-600">{weatherData.feelsLike}°</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowWeatherModal(false)}
                                        className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                                    >
                                        Close Forecast
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-red-500 font-bold">Failed to load weather data.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Map Modal */}
            {showMapModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowMapModal(false)} />
                    <div className="bg-white rounded-[3rem] w-full max-w-4xl h-[80vh] flex flex-col relative animate-in zoom-in duration-300 shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Pick Location</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                                    {isReverseGeocoding ? <Loader2 size={12} className="animate-spin text-indigo-500" /> : <MapPin size={12} />}
                                    {isReverseGeocoding ? 'Finding address...' : (formData.destination || 'Click anywhere on the map')}
                                </p>
                            </div>
                            <button 
                                onClick={() => setShowMapModal(false)}
                                className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-colors border border-transparent hover:border-slate-100"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="flex-1 relative">
                            {/* Map Search Overlay */}
                            <div className="absolute top-6 left-6 right-6 z-[1000] max-w-lg">
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Search size={18} />
                                    </div>
                                    <input 
                                        type="text"
                                        placeholder="Search for a place..."
                                        value={mapSearchQuery}
                                        onChange={(e) => {
                                            setMapSearchQuery(e.target.value);
                                            searchOnMap(e.target.value);
                                        }}
                                        className="w-full pl-12 pr-12 py-4 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm"
                                    />
                                    {isMapSearching && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <Loader2 size={16} className="text-indigo-500 animate-spin" />
                                        </div>
                                    )}
                                    
                                    {mapSuggestions.length > 0 && (
                                        <div className="absolute top-full mt-2 left-0 right-0 bg-white/95 backdrop-blur-md border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 max-h-60 overflow-y-auto custom-scrollbar">
                                            {mapSuggestions.map((s, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => handleSelectMapSuggestion(s)}
                                                    className="w-full px-5 py-4 text-left border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors flex items-start gap-3 group/item border-l-4 border-l-transparent hover:border-l-indigo-500"
                                                >
                                                    <MapPin size={16} className="text-slate-400 mt-0.5 group-hover/item:text-indigo-500 transition-colors" />
                                                    <span className="text-xs font-bold text-slate-600 group-hover/item:text-slate-900">{s.display_name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <MapContainer 
                                center={mapPosition || [20.5937, 78.9629]} 
                                zoom={mapPosition ? 15 : 5} 
                                style={{ height: '100%', width: '100%' }}
                                className="z-0"
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                />
                                <MapEvents />
                                {mapPosition && <Marker position={mapPosition} />}
                                {mapPosition && <ChangeView center={mapPosition} />}
                            </MapContainer>
                        </div>
                        
                        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3 rounded-b-[3rem]">
                            <button 
                                onClick={() => setShowMapModal(false)}
                                className="px-8 py-4 bg-white text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-sm border border-slate-200 hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => setShowMapModal(false)}
                                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100 hover:bg-slate-900 transition-all active:scale-95"
                                disabled={!formData.destination || isReverseGeocoding}
                            >
                                Confirm Location
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm mx-4 animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-12 h-12" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip {isEditing ? 'Updated' : 'Created'}!</h2>
                        <p className="text-gray-500">Your adventure to {formData.destination} has been saved.</p>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden relative border border-slate-100">
                <button
                    onClick={() => navigate('/find-travelers')}
                    type="button"
                    className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full z-10"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="py-12 px-8 md:px-16">
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">
                            {isEditing ? 'Modify Your Adventure' : 'Plan Your New Journey'}
                        </h1>
                        <p className="text-slate-400 font-medium">Fill out the details to create your perfect itinerary.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-12">
                        {/* Basic Info */}
                        <section className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                            <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Briefcase size={20} /></div>
                                Basic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Trip Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        placeholder="e.g., Summer Escape 2026"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className={`w-full px-5 py-4 rounded-2xl border ${errors.title ? 'border-red-500 bg-red-50' : 'border-slate-200'} outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium`}
                                    />
                                    {errors.title && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.title}</p>}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Destination</label>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowMapModal(true)}
                                                className="group flex items-center gap-1.5 px-3 py-1 bg-white text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm transition-all hover:bg-emerald-600 hover:text-white active:scale-95"
                                            >
                                                <MapPin size={12} />
                                                Pick on Map
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleShowWeather}
                                                className="group flex items-center gap-1.5 px-3 py-1 bg-white text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm transition-all hover:bg-indigo-600 hover:text-white active:scale-95"
                                            >
                                                <CloudSun size={12} />
                                                Check Weather
                                            </button>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="destination"
                                            placeholder="Where to?"
                                            value={formData.destination}
                                            onChange={handleInputChange}
                                            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                                            className={`w-full pl-12 pr-12 py-4 rounded-2xl border ${errors.destination ? 'border-red-500 bg-red-50' : 'border-slate-200'} outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium`}
                                        />
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />

                                        {isSearchingLoading && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <Loader2 size={16} className="text-indigo-500 animate-spin" />
                                            </div>
                                        )}

                                        {/* Suggestions Dropdown */}
                                        {showSuggestions && suggestions.length > 0 && (
                                            <div className="absolute top-[100%] left-0 right-0 z-[100] mt-2 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                                <div className="p-2 border-b border-slate-50 flex items-center justify-between px-6 py-3">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Did you mean?</span>
                                                    <button onClick={(e) => { e.stopPropagation(); setShowSuggestions(false); }} className="text-slate-300 hover:text-slate-500"><X size={12} /></button>
                                                </div>
                                                <div className="max-h-64 overflow-y-auto">
                                                    {suggestions.map((s, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => handleSelectSuggestion(s)}
                                                            className="w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 flex items-start gap-3 group"
                                                        >
                                                            <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                                                <MapPin size={14} />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-700 text-sm leading-tight">{s.display_name.split(',')[0]}</p>
                                                                <p className="text-[10px] text-slate-400 font-medium mt-0.5 line-clamp-1">{s.display_name.split(',').slice(1).join(',')}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {errors.destination && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.destination}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Start Date</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                name="startDate"
                                                value={formData.startDate}
                                                onChange={handleInputChange}
                                                className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                                            />
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">End Date</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                name="endDate"
                                                value={formData.endDate}
                                                onChange={handleInputChange}
                                                className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                                            />
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Config Section */}
                        <section className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                            <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><IndianRupee size={20} /></div>
                                Preferences & Budget
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Travelers</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="travelers"
                                            min="1"
                                            value={formData.travelers}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                                        />
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Transport</label>
                                    <div className="relative">
                                        <select
                                            name="transport"
                                            value={formData.transport}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-200 outline-none bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium appearance-none"
                                        >
                                            <option value="flight">Flight</option>
                                            <option value="train">Train</option>
                                            <option value="car">Car Rental</option>
                                            <option value="bus">Bus</option>
                                        </select>
                                        <Plane className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Budget (₹)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="budget"
                                            placeholder="Estimated budget"
                                            value={formData.budget}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                                        />
                                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    </div>
                                    {errors.budget && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.budget}</p>}
                                </div>
                            </div>
                        </section>

                        {/* Interests Section */}
                        <section className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><MapPin size={20} /></div>
                                    Interests & Tags
                                </h3>

                                {isAddingInterest ? (
                                    <div className="flex gap-2 animate-in slide-in-from-right-4 duration-300">
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="What else?"
                                            value={newInterestText}
                                            onChange={(e) => setNewInterestText(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                                            className="px-4 py-2 bg-white border border-indigo-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-xs"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddInterest}
                                            className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-all"
                                        >
                                            <Plus size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setIsAddingInterest(false); setNewInterestText(''); }}
                                            className="bg-slate-100 text-slate-400 p-2 rounded-xl hover:bg-slate-200 transition-all"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingInterest(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm transition-all hover:bg-indigo-600 hover:text-white active:scale-95"
                                    >
                                        <Plus size={14} /> Add New
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {allInterests.map((interest) => (
                                    <div
                                        key={interest}
                                        onClick={() => handleInterestChange(interest)}
                                        className={`px-5 py-3 rounded-2xl border-2 transition-all cursor-pointer select-none font-bold text-xs flex items-center gap-2
                                            ${formData.interests.includes(interest)
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105'
                                                : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-300'}`}
                                    >
                                        {formData.interests.includes(interest) && <CheckCircle size={14} />}
                                        {interest}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-4 pt-10 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => navigate('/find-travelers')}
                                className="w-full md:w-auto px-12 py-5 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-100 transition-all"
                            >
                                Discard
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full md:w-auto px-16 py-5 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-2xl shadow-indigo-200 hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText size={16} />}
                                {isSubmitting ? 'Saving...' : (isEditing ? 'Update Trip' : 'Create My Journey')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateTripPage;

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  User,
  IndianRupee,
  ArrowLeft,
  Plane,
  CheckCircle,
  Sparkles,
  X,
  Loader2,
  CloudSun,
  Plus,
  Search,
  Thermometer,
  Wind,
  Droplets,
  Sun,
  Cloud,
  CloudRain,
} from 'lucide-react';

import { LocationInput } from '../../components/LocationInput';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

import { authService } from '../../services/auth.service';
import { tripService } from '../../services/trip.service';
import { nearbyService } from '../../services/nearby.service';
import { weatherService, type WeatherData } from '../../services/weather.service';

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
  'Beaches',
  'Adventure Sports',
  'Shopping',
  'City Tours',
  'History/Culture',
  'Nightlife',
  'Nature/Parks',
  'Food & Dining',
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
        } catch (_error) {
          console.error(_error);
          toast.error('Failed to load trip details');
          navigate('/profile');
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchTrip();
    }
  }, [id, isEditing, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
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
      toast.error('Please enter a destination first');
      return;
    }

    try {
      setIsWeatherLoading(true);
      setShowWeatherModal(true);
      const data = await weatherService.getWeather(formData.destination);
      setWeatherData(data);
    } catch (_error) {
      toast.error('Could not find weather for this location.');
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
        interests: [...prev.interests, trimmed],
      }));
    }

    setNewInterestText('');
    setIsAddingInterest(false);
  };

  const handleMapClick = async (lat: number, lon: number) => {
    setMapPosition([lat, lon]);
    setIsReverseGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      if (data.display_name) {
        setFormData(prev => ({ ...prev, destination: data.display_name }));
        setMapSearchQuery(data.display_name);
      }
    } catch (_error) {
      console.error('Reverse geocoding _error:', _error);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const searchOnMap = async (query: string) => {
    if (!query || query.length < 3) return;
    setIsMapSearching(true);
    try {
      const data = await nearbyService.getSuggestions(query);
      setMapSuggestions(data as { display_name: string; lat: string; lon: string }[]);
    } catch (_error) {
      console.error('Map search _error:', _error);
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
      click(e) {
        handleMapClick(e.latlng.lat, e.latlng.lng);
      },
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

    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.destination) newErrors.destination = 'Destination is required';
    if (!start) newErrors.startDate = 'Start date is required';
    if (!end) newErrors.endDate = 'End date is required';
    else if (start && end < start) newErrors.endDate = 'End date cannot be before start date';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInterestChange = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateTripData()) return;

    setIsSubmitting(true);
    try {
      const tripData = {
        userId: user?._id || user?.id,
        title: formData.title,
        destination: formData.destination,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        budget: Number(formData.budget),
        preferences: {
          travelers: formData.travelers,
          accommodation: formData.accommodation,
          transport: formData.transport,
          interests: formData.interests,
        },
        description: formData.notes,
      };

      if (isEditing && id) {
        await tripService.updateTrip(id, tripData);
        toast.success('Trip updated successfully!');
      } else {
        await tripService.createTrip(tripData);
        toast.success('Trip created successfully!');
      }
      setShowSuccess(true);
      setTimeout(() => navigate('/profile'), 2000);
    } catch (_error: unknown) {
      const errorObj = _error as { response?: { data?: { message?: string } } };
      const msg = errorObj.response?.data?.message || 'An unexpected error occurred.';
      console.error('Trip operation failed:', _error);
      toast.error(msg || `Failed to ${isEditing ? 'update' : 'create'} trip`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-outfit">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Preparing your adventure details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-outfit py-12 px-4 relative">
      <div className="max-w-4xl mx-auto mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Profile</span>
        </button>
      </div>

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl h-[80vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Select Location
                </h3>
                <p className="text-slate-400 text-xs font-medium mt-1">
                  Click anywhere on the map to pick your destination.
                </p>
              </div>
              <button
                onClick={() => setShowMapModal(false)}
                className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 relative">
              {/* Inner Search Bar on Map */}
              <div className="absolute top-6 left-6 right-6 z-[1000] max-w-md">
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                    {isMapSearching ? (
                      <Loader2 size={18} className="animate-spin text-indigo-500" />
                    ) : (
                      <Search size={18} />
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Search for a place..."
                    value={mapSearchQuery}
                    onChange={e => {
                      setMapSearchQuery(e.target.value);
                      searchOnMap(e.target.value);
                    }}
                    className="w-full pl-14 pr-6 py-4 bg-white/95 backdrop-blur-xl border border-white rounded-2xl shadow-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />

                  {mapSuggestions.length > 0 && (
                    <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-64 overflow-y-auto">
                      {mapSuggestions.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectMapSuggestion(s)}
                          className="w-full flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 text-left group"
                        >
                          <MapPin
                            size={16}
                            className="text-slate-400 mt-0.5 group-hover:text-indigo-500 transition-colors"
                          />
                          <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">
                            {s.display_name}
                          </span>
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

      {/* Weather Modal */}
      {showWeatherModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white/80 backdrop-blur-2xl w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <CloudSun className="text-indigo-500" size={24} />
                Weather Forecast
              </h3>
              <button
                onClick={() => setShowWeatherModal(false)}
                className="text-slate-400 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-10 text-center">
              {isWeatherLoading ? (
                <div className="py-12">
                  <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Analyzing meteorological patterns...</p>
                </div>
              ) : weatherData ? (
                <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-200">
                    <div className="flex justify-center mb-4">
                      {weatherData.condition.toLowerCase().includes('sun') ? (
                        <Sun className="w-20 h-20" />
                      ) : weatherData.condition.toLowerCase().includes('rain') ? (
                        <CloudRain className="w-20 h-20" />
                      ) : (
                        <Cloud className="w-20 h-20" />
                      )}
                    </div>
                    <p className="text-6xl font-black mb-1">{Math.round(weatherData.temp)}°</p>
                    <p className="text-sm font-black uppercase tracking-[0.2em] opacity-80">
                      {weatherData.condition}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <Droplets size={16} className="text-blue-500 mx-auto mb-2" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Humidity
                      </p>
                      <p className="font-bold text-slate-700">{weatherData.humidity}%</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <Wind size={16} className="text-slate-400 mx-auto mb-2" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Wind
                      </p>
                      <p className="font-bold text-slate-700">{weatherData.windSpeed} km/h</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <Thermometer size={16} className="text-red-400 mx-auto mb-2" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Scale
                      </p>
                      <p className="font-bold text-slate-700">Celsius</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 italic">
                    Expected weather in {formData.destination}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-sm mx-4 animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
              Adventure Locked!
            </h2>
            <p className="text-slate-400 font-medium">
              Your journey to{' '}
              <span className="text-indigo-600 font-bold">{formData.destination}</span> has been
              successfully saved.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden relative border border-slate-100">
        <button
          onClick={() => navigate('/find-travelers')}
          type="button"
          className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors p-3 hover:bg-slate-50 rounded-2xl z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="py-16 px-8 md:px-20">
          <div className="mb-16 text-center">
            <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-6">
              <Plane size={32} />
            </div>
            <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">
              {isEditing ? 'Modify Adventure' : 'Plan Your Journey'}
            </h1>
            <p className="text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
              Let's refine the details of your upcoming travel experience.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Basic Info */}
            <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black">
                  01
                </div>
                <h3 className="text-xl font-black text-slate-900">Essential Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Trip Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. Himalayan Summer Escape"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-6 py-4 rounded-2xl border ${errors.title ? 'border-red-500 bg-red-50' : 'border-slate-100 bg-slate-50'} outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-700`}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.title}</p>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Destination
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowMapModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-white text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-100 shadow-sm hover:bg-emerald-600 hover:text-white transition-all"
                      >
                        <MapPin size={10} />
                        Map
                      </button>
                      <button
                        type="button"
                        onClick={handleShowWeather}
                        className="flex items-center gap-1.5 px-3 py-1 bg-white text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-100 shadow-sm hover:bg-indigo-600 hover:text-white transition-all"
                      >
                        <CloudSun size={10} />
                        Weather
                      </button>
                    </div>
                  </div>
                  <LocationInput
                    value={formData.destination}
                    onChange={val => {
                      setFormData(prev => ({ ...prev, destination: val }));
                      if (errors.destination)
                        setErrors(prev => {
                          const newErrs = { ...prev };
                          delete newErrs.destination;
                          return newErrs;
                        });
                    }}
                    placeholder="Where are you heading?"
                    error={errors.destination}
                  />
                  {errors.destination && (
                    <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">
                      {errors.destination}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6 md:col-span-2">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Departure
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className={`w-full pl-14 pr-6 py-4 rounded-2xl border ${errors.startDate ? 'border-red-500 bg-red-50' : 'border-slate-100 bg-slate-50'} focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700`}
                      />
                      <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    </div>
                    {errors.startDate && (
                      <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">
                        {errors.startDate}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Return
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className={`w-full pl-14 pr-6 py-4 rounded-2xl border ${errors.endDate ? 'border-red-500 bg-red-50' : 'border-slate-100 bg-slate-50'} focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700`}
                      />
                      <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    </div>
                    {errors.endDate && (
                      <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">
                        {errors.endDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Logistics */}
            <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black">
                  02
                </div>
                <h3 className="text-xl font-black text-slate-900">Preferences</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Party Size
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="travelers"
                      min="1"
                      value={formData.travelers}
                      onChange={handleInputChange}
                      className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-700"
                    />
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Transportation
                  </label>
                  <div className="relative">
                    <select
                      name="transport"
                      value={formData.transport}
                      onChange={handleInputChange}
                      className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium appearance-none text-slate-700"
                    >
                      <option value="flight">Flight</option>
                      <option value="train">Train</option>
                      <option value="car">Car Rental</option>
                      <option value="bus">Bus/Public</option>
                    </select>
                    <Plane className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Budget (INR)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="budget"
                      placeholder="50000"
                      value={formData.budget}
                      onChange={handleInputChange}
                      className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black text-indigo-600"
                    />
                    <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block mb-4">
                  Interested In
                </label>
                <div className="flex flex-wrap gap-3">
                  {allInterests.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestChange(interest)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        formData.interests.includes(interest)
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100'
                          : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                  {isAddingInterest ? (
                    <div className="flex gap-2 animate-in slide-in-from-left-2 transition-all">
                      <input
                        autoFocus
                        type="text"
                        value={newInterestText}
                        onChange={e => setNewInterestText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddInterest()}
                        className="px-4 py-2 text-xs border border-indigo-500 rounded-xl outline-none"
                        placeholder="Custom tag..."
                      />
                      <button
                        onClick={handleAddInterest}
                        className="p-2 bg-indigo-600 text-white rounded-xl"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => setIsAddingInterest(false)}
                        className="p-2 bg-slate-100 text-slate-400 rounded-xl"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingInterest(true)}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white flex items-center gap-2 hover:bg-slate-800 transition-all"
                    >
                      <Plus size={14} /> Other
                    </button>
                  )}
                </div>
              </div>
            </section>

            <div className="flex items-center justify-between gap-6 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all"
              >
                Cancel Plan
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-12 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-slate-200 hover:bg-indigo-600 hover:-translate-y-1 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                {isEditing ? 'Save Changes' : 'Launch Adventure'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTripPage;

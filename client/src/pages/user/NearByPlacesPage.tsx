import { useState, useEffect } from 'react';
import { 
    ArrowLeft, MapPin, Loader2, Navigation, 
    Coffee, Utensils, Camera, TreePine, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { nearbyService, type Place } from '../../services/c.nearby.service';
import toast from 'react-hot-toast';
import L from 'leaflet';

// Fix for default marker icon in Leaflet + React/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Sub-component to handle map view updates
const RecenterMap = ({ lat, lon }: { lat: number, lon: number }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lon], 14);
    }, [lat, lon, map]);
    return null;
};

export const NearByPlacesPage = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [places, setPlaces] = useState<Place[]>([]);
    const [currentPos, setCurrentPos] = useState<[number, number]>([51.505, -0.09]); // Default to London
    const [displayName, setDisplayName] = useState('');

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim()) return toast.error("Please enter a place name");

        try {
            setLoading(true);
            const location = await nearbyService.searchPlace(query);
            if (location) {
                setCurrentPos([location.lat, location.lon]);
                setDisplayName(location.display_name);
                const nearby = await nearbyService.getNearbyPlaces(location.lat, location.lon);
                setPlaces(nearby);
            } else {
                toast.error("Place not found. Try another location.");
            }
        } catch (error) {
            toast.error("Error searching for places.");
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (type: string) => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes('restaurant') || lowerType.includes('food')) return <Utensils className="w-4 h-4" />;
        if (lowerType.includes('cafe') || lowerType.includes('bar')) return <Coffee className="w-4 h-4" />;
        if (lowerType.includes('tourism') || lowerType.includes('attraction')) return <Camera className="w-4 h-4" />;
        if (lowerType.includes('park') || lowerType.includes('garden')) return <TreePine className="w-4 h-4" />;
        return <Info className="w-4 h-4" />;
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-outfit">
            {/* Header Area */}
            <div className="max-w-7xl mx-auto w-full px-6 py-6 md:py-8 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-[1001]">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                    <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200 group-hover:rotate-12 transition-transform">
                        <Navigation className="text-white w-5 h-5 rotate-45" />
                    </div>
                    <span className="text-2xl font-black text-slate-900 tracking-tighter">Trip Buddy</span>
                </div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-white text-slate-600 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-100 flex items-center gap-2 text-sm active:scale-95"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
            </div>

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-8">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3 tracking-tighter">Nearby Explorer</h1>
                    <p className="text-slate-400 font-medium">Discover hidden gems and local favorites anywhere in the world.</p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Enter a city or place..."
                            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-xl shadow-slate-200/50 text-slate-700 font-medium"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500 w-6 h-6" />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Explore Nearby"}
                    </button>
                </form>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
                    {/* Places List */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col order-2 lg:order-1">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Nearby Places</h3>
                            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2.5 py-1 rounded-full">{places.length} found</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {places.length > 0 ? (
                                <div className="space-y-3">
                                    {places.map((place) => (
                                        <div 
                                            key={place.id}
                                            className="p-4 rounded-2xl border border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all cursor-pointer group"
                                            onClick={() => setCurrentPos([place.lat, place.lon])}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors shadow-sm">
                                                    {getTypeIcon(place.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{place.name}</h4>
                                                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{place.type.replace(/_/g, ' ')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                        <Info size={32} className="text-slate-300" />
                                    </div>
                                    <p className="font-black text-slate-300 uppercase tracking-widest text-xs">No places shown</p>
                                    <p className="text-slate-400 text-[11px] mt-1 italic">Search for a location to see results here.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Map Area */}
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] border-4 border-white shadow-2xl relative overflow-hidden order-1 lg:order-2">
                        {displayName && (
                            <div className="absolute top-6 left-6 z-[1000] max-w-[80%]">
                                <div className="bg-slate-900/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3">
                                    <div className="bg-indigo-500 rounded-full p-1.5 flex-shrink-0">
                                        <MapPin size={14} />
                                    </div>
                                    <p className="text-[12px] font-bold line-clamp-1">{displayName}</p>
                                </div>
                            </div>
                        )}
                        
                        <MapContainer 
                            center={currentPos} 
                            zoom={13} 
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={true}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <RecenterMap lat={currentPos[0]} lon={currentPos[1]} />
                            
                            {/* Main Search Marker */}
                            <Marker position={currentPos}>
                                <Popup>
                                    <div className="font-bold p-1 text-indigo-700">Currently exploring: {query || displayName || 'Center'}</div>
                                </Popup>
                            </Marker>

                            {/* Nearby Places Markers */}
                            {places.map((place) => (
                                <Marker 
                                    key={place.id} 
                                    position={[place.lat, place.lon]}
                                >
                                    <Popup>
                                        <div className="p-2 min-w-[150px]">
                                            <h4 className="font-black text-slate-900 mb-1 leading-tight">{place.name}</h4>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                {getTypeIcon(place.type)}
                                                <span>{place.type.replace(/_/g, ' ')}</span>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>

                        {loading && (
                            <div className="absolute inset-0 z-[1001] bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
                                <div className="bg-white p-8 rounded-[2rem] shadow-2xl flex flex-col items-center gap-4">
                                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                                    <p className="font-black text-slate-900 uppercase tracking-[0.2em] text-[10px]">Scanning Terrain...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E2E8F0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #CBD5E1;
                }
                .leaflet-container {
                    font-family: inherit;
                }
                .leaflet-popup-content-wrapper {
                    border-radius: 20px;
                    padding: 8px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                }
                .leaflet-popup-tip-container {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default NearByPlacesPage;

import { useEffect, useState } from 'react';
import { tripService } from '../../services/c.trip.service';
import { TravelerCard } from '../../components/TravelerCard';
import type { ITrip } from '../../interface/ITripdetails';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, MapPin, Plane, Tag } from 'lucide-react';
import { Pagination } from '../../components/Pagination';

const INTERESTS_LIST = [
    "Any", "Beaches", "Adventure Sports", "Shopping", "City Tours",
    "History/Culture", "Nightlife", "Nature/Parks", "Food & Dining"
];

const FindTravelers = () => {
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 6;
    const [trips, setTrips] = useState<ITrip[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        destination: '',
        transport: 'Any',
        interest: 'Any'
    });

    useEffect(() => {
        loadTrips();
    }, [page]);

    const loadTrips = async () => {
        setLoading(true);
        try {
            const activeFilters: any = {
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, v]) => v !== 'Any' && v !== '')
                ),
                page,
                limit
            };

            const response = await tripService.getAllTrips(activeFilters);
            setTrips(response.trips);
            setTotalPages(Math.ceil(response.total / limit));
        } catch (error) {
            console.error("Error fetching trips:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFilters = () => {
        setPage(1);
        loadTrips();
    };

    const handleClearFilters = () => {
        const defaultFilters = {
            destination: '',
            transport: 'Any',
            interest: 'Any'
        };
        setFilters(defaultFilters);
        setPage(1);
        setLoading(true);
        tripService.getAllTrips({ page: 1, limit }).then((response) => {
            setTrips(response.trips);
            setTotalPages(Math.ceil(response.total / limit));
        }).catch(error => {
            console.error("Error fetching trips:", error);
        }).finally(() => {
            setLoading(false);
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 mb-8 text-slate-500 hover:text-indigo-600 transition-all group font-medium"
                >
                    <div className="p-2 bg-white rounded-full shadow-sm group-hover:bg-indigo-50 border border-transparent group-hover:border-indigo-100 transition-all">
                        <ChevronLeft className="w-5 h-5" />
                    </div>
                    Back to Dashboard
                </button>

                <header className="mb-10 text-center">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Find Travel Buddies</h1>
                    <p className="text-slate-500 mt-2 text-lg">Connect with people heading to your next destination</p>
                </header>

                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-semibold text-slate-700 mb-2 items-center gap-2">
                            <MapPin className="w-4 h-4 text-indigo-500" /> Destination
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Bali, Paris..."
                            className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50/50"
                            value={filters.destination}
                            onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
                        />
                    </div>

                    <div className="flex-1 w-full">
                        <label className=" text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                            <Plane className="w-4 h-4 text-indigo-500" /> Travel Mode
                        </label>
                        <select
                            className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white appearance-none cursor-pointer"
                            value={filters.transport}
                            onChange={(e) => setFilters({ ...filters, transport: e.target.value })}
                        >
                            <option value="Any">Any Mode</option>
                            <option value="flight">Flight</option>
                            <option value="train">Train</option>
                            <option value="car">Car Rental</option>
                            <option value="bus">Bus</option>
                        </select>
                    </div>

                    <div className="flex-1 w-full">
                        <label className="block text-sm font-semibold text-slate-700 mb-2 items-center gap-2">
                            <Tag className="w-4 h-4 text-indigo-500" /> Interests
                        </label>
                        <select
                            className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white appearance-none cursor-pointer"
                            value={filters.interest}
                            onChange={(e) => setFilters({ ...filters, interest: e.target.value })}
                        >
                            {INTERESTS_LIST.map(interest => (
                                <option key={interest} value={interest}>{interest}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <button
                            onClick={handleClearFilters}
                            className="flex-1 px-6 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            Clear
                        </button>
                        <button
                            onClick={handleApplyFilters}
                            className="flex-1 px-8 py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            <Search className="w-5 h-5" />
                            Apply
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-medium">Looking for travel buddies...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {trips.length > 0 ? (
                                trips.map(trip => (
                                    <TravelerCard key={trip._id} trip={trip} />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
                                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800">No travel buddies found</h3>
                                    <p className="text-slate-500">Try adjusting your filters to see more results.</p>
                                </div>
                            )}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center">
                                <Pagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    onPageChange={(newPage) => {
                                        setPage(newPage);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default FindTravelers;

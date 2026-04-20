import { useEffect, useState } from 'react';
import { Search, MapPin, Plane, Tag, RotateCcw, ChevronDown } from 'lucide-react';
import { tripService } from '../../services/c.trip.service';
import { TravelerCard } from '../../components/TravelerCard';
import { Pagination } from '../../components/Pagination';
import { Navbar } from '../../components/home/Navbar';
import type { ITrip } from '../../interface/ITripdetails';

const INTERESTS_LIST = [
  'Beaches',
  'Adventure Sports',
  'Shopping',
  'City Tours',
  'History/Culture',
  'Nightlife',
  'Nature/Parks',
  'Food & Dining',
];

const FindTravelers = () => {
  const [trips, setTrips] = useState<ITrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;

  const [filters, setFilters] = useState({
    destination: '',
    transport: 'Any',
    interest: 'Any',
  });

  const loadTrips = async (currentFilters = filters, currentPage = page) => {
    setLoading(true);
    try {
      const activeFilters: Record<string, string | number> = {
        page: currentPage,
        limit,
      };

      if (currentFilters.destination) activeFilters.destination = currentFilters.destination;
      if (currentFilters.transport !== 'Any') activeFilters.transport = currentFilters.transport;
      if (currentFilters.interest !== 'Any') activeFilters.interest = currentFilters.interest;

      const response = await tripService.getAllTrips(activeFilters);
      setTrips(response.trips);
      setTotalPages(Math.ceil(response.total / limit));
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, [page]);

  const handleApplyFilters = () => {
    setPage(1);
    loadTrips(filters, 1);
  };

  const handleClearFilters = () => {
    const defaultFilters = {
      destination: '',
      transport: 'Any',
      interest: 'Any',
    };
    setFilters(defaultFilters);
    setPage(1);
    loadTrips(defaultFilters, 1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <Navbar variant="sticky" showBack={true} backPath="/dashboard" />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Horizontal Search Bar */}
        <div className="bg-white p-4 rounded-[28px] shadow-xl border border-slate-100 mb-12 flex flex-col md:flex-row items-center gap-3">
          {/* Destination */}
          <div className="flex-1 w-full relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-tb-purple transition-colors">
              <MapPin className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Where are you going?"
              className="w-full pl-12 pr-4 py-4 md:py-5 bg-slate-50 group-hover:bg-slate-100 focus:bg-white border-2 border-transparent focus:border-tb-purple/20 rounded-2xl outline-none transition-all font-semibold text-slate-700"
              value={filters.destination}
              onChange={e => setFilters({ ...filters, destination: e.target.value })}
            />
          </div>

          {/* Transport */}
          <div className="w-full md:w-56 relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Plane className="w-5 h-5" />
            </div>
            <select
              className="w-full pl-12 pr-10 py-4 md:py-5 bg-slate-50 border-2 border-transparent focus:border-tb-purple/20 rounded-2xl outline-none transition-all font-semibold text-slate-700 appearance-none cursor-pointer"
              value={filters.transport}
              onChange={e => setFilters({ ...filters, transport: e.target.value })}
            >
              <option value="Any">Any Transport</option>
              <option value="flight">Flight</option>
              <option value="train">Train</option>
              <option value="car">Car Rental</option>
              <option value="bus">Bus</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Interest */}
          <div className="w-full md:w-64 relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Tag className="w-5 h-5" />
            </div>
            <select
              className="w-full pl-12 pr-10 py-4 md:py-5 bg-slate-50 border-2 border-transparent focus:border-tb-purple/20 rounded-2xl outline-none transition-all font-semibold text-slate-700 appearance-none cursor-pointer"
              value={filters.interest}
              onChange={e => setFilters({ ...filters, interest: e.target.value })}
            >
              <option value="Any">Any Interest</option>
              {INTERESTS_LIST.map(item => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={handleClearFilters}
              className="p-4 md:p-5 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center"
              title="Clear Filters"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
            <button
              onClick={handleApplyFilters}
              className="flex-1 md:flex-none px-8 py-4 md:py-5 bg-tb-purple  font-bold rounded-2xl shadow-lg shadow-purple-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800">Explore Trips</h2>
            <p className="text-slate-500 font-medium mt-1">
              {loading
                ? 'Discovering adventures...'
                : `Found ${trips.length} amazing trips to join`}
            </p>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className="h-72 bg-white animate-pulse rounded-[32px] border border-slate-100"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trips.length > 0 ? (
                trips.map(trip => <TravelerCard key={trip._id} trip={trip} />)
              ) : (
                <div className="col-span-full py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-6">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Search className="w-12 h-12 text-slate-200" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">No matching trips</h3>
                  <p className="text-slate-500 max-w-sm mx-auto mt-3 text-lg">
                    We couldn't find any trips matching your filters. Try widening your search!
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="mt-8 px-6 py-3 bg-tb-purple/10 text-tb-purple font-bold rounded-xl hover:bg-tb-purple/20 transition-all"
                  >
                    Reset all filters
                  </button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center pb-12">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={newPage => {
                    setPage(newPage);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default FindTravelers;

import  { useEffect, useState } from 'react';
import { tripService } from '../services/trip.service';
import { TravelerCard } from '../components/TravelerCard';
import type { ITrip } from '../interface/ITripdetails';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
// Import your Pagination component here
import { Pagination } from '../components/Pagination'; 

export const FindTravelers = () => {
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

  // CHANGE 1: Added 'page' to dependency array so it re-fetches when you click "Next/Prev"
  useEffect(() => {
    loadTrips();
  }, [page]); 

  const loadTrips = async () => {
    setLoading(true);
    try {
      const activeFilters = {
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== 'Any' && v !== '')),
        page, 
        limit
      };
      
      // CHANGE 2: Destructure the object response { trips, total }
      const response = await tripService.getAllTrips(activeFilters);
      
      setTrips(response.trips);
      // Calculate total pages based on the 'total' count from backend
      setTotalPages(Math.ceil(response.total / limit)); 
      
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  };

  // CHANGE 3: Reset to page 1 whenever a new search is performed
  const handleApplyFilters = () => {
    setPage(1);
    loadTrips();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 mb-6 text-slate-500 hover:text-indigo-600 transition-all group font-medium"
        >
          <div className="p-2 bg-white rounded-full shadow-sm group-hover:bg-indigo-50 border border-transparent group-hover:border-indigo-100">
            <ChevronLeft className="w-5 h-5" />
          </div>
          Back to Dashboard
        </button>

        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900">Find Travel Buddies</h1>
        </header>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
            <input 
              type="text" 
              placeholder="e.g. Goa" 
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              value={filters.destination}
              onChange={(e) => setFilters({...filters, destination: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Travel Mode</label>
            <select 
              className="w-full p-3 border rounded-xl"
              value={filters.transport}
              onChange={(e) => setFilters({...filters, transport: e.target.value})}
            >
              <option>Any</option>
              <option value="flight">Flight</option>
              <option value="train">Train</option>
              <option value="car">Car</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interests</label>
            <select 
              className="w-full p-3 border rounded-xl"
              value={filters.interest}
              onChange={(e) => setFilters({...filters, interest: e.target.value})}
            >
              <option>Any</option>
              <option>Beaches</option>
              <option>Adventure</option>
              <option>Nightlife</option>
            </select>
          </div>

          <button onClick={handleApplyFilters} className="bg-[#10b981] text-white py-3 rounded-xl font-bold hover:bg-green-600 transition">
            Apply Filters
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">Loading travelers...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trips.length > 0 ? (
                trips.map(trip => <TravelerCard key={trip._id} trip={trip} />)
              ) : (
                <div className="col-span-full text-center py-20 text-gray-500">
                  No travel buddies found for this search.
                </div>
              )}
            </div>

            {/* CHANGE 4: Uncommented and added window scroll for UX */}
            {totalPages > 1 && (
              <Pagination 
                currentPage={page} 
                totalPages={totalPages} 
                onPageChange={(newPage) => {
                  setPage(newPage);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};
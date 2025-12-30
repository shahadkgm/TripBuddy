// src/modules/guides/pages/FindGuidesPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal, MapPin, Search } from 'lucide-react';
import axios from 'axios';
import { GuideCard } from '../components/GuideCard';

const API_URL = import.meta.env.VITE_API_URL;

export const FindGuidesPage = () => {
  const navigate = useNavigate();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [destination, setDestination] = useState("");
  const [maxPrice, setMaxPrice] = useState(200);
 
    const fetchGuides = async (filters = {}) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/guides/all`, { params: filters });
      setGuides(res.data);
    } catch (err) {
      console.error("Error fetching guides", err);
    } finally {
      setLoading(false);
    }
  };
   useEffect(() => {
    fetchGuides();
  }, []);

  const handleApplyFilters = () => {
    fetchGuides({
      destination: destination,
      maxPrice: maxPrice
    });
  };
  

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-slate-800">Find Local Experts</h1>
          </div>
          <button onClick={() => navigate('/dashboard')} className="text-sm font-medium text-tb-purple hover:underline">
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-6">
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-6">Filters</h2>
            
            <div className="space-y-5">
              <div>
  <label className="text-sm font-semibold text-gray-700 block mb-2">Destination</label>
  <div className="relative">
    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
    <input 
      type="text"
      placeholder="Search city (e.g. Goa)"
      value={destination}
      onChange={(e) => setDestination(e.target.value)}
      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-tb-purple outline-none bg-white"
    />
  </div>
</div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Max Hourly Rate: ${maxPrice}</label>
                <input 
                  type="range" min="10" max="200" value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-tb-purple" 
                />
              </div>

              {/* 5. Add the onClick handler here */}
              <button 
                onClick={handleApplyFilters}
                className="w-full py-3 bg-tb-purple text-black font-bold rounded-xl shadow-lg hover:bg-opacity-90 transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </aside>

        {/* Right Content: Listing */}
        <section className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">
              {loading ? "Searching..." : `${guides.length} Experts found`}
            </h2>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6">
              {guides.map((guide: any) => (
                <GuideCard key={guide._id} guide={guide} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
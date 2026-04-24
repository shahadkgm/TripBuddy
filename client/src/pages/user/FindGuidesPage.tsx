import React, { useEffect, useState } from 'react';
import { Search, MapPin, RotateCcw, SlidersHorizontal } from 'lucide-react';
import api from '../../utils/api';
import { GuideCard } from '../../components/GuideCard';
import { Pagination } from '../../components/Pagination';
import { Navbar } from '../../components/home/Navbar';

import type { IGuide } from '../../interface/IGuide';

const FindGuidesPage: React.FC = () => {
  const [guides, setGuides] = useState<IGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [destination, setDestination] = useState('');
  const [maxPrice, setMaxPrice] = useState(5000);

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;

  const fetchGuides = async (currentPage = page, filters = { destination, maxPrice }) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/guides/all`, {
        params: {
          ...filters,
          page: currentPage,
          limit,
        },
      });
      setGuides(res.data.data.guides);
      setTotalPages(Math.ceil(res.data.data.total / limit));
    } catch (_err) {
      console.error('Error fetching guides', _err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides(page);
  }, [page]);

  const handleApplyFilters = () => {
    setPage(1);
    fetchGuides(1, { destination, maxPrice });
  };

  const handleReset = () => {
    setDestination('');
    setMaxPrice(5000);
    setPage(1);
    fetchGuides(1, { destination: '', maxPrice: 5000 });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <Navbar variant="sticky" showBack={true} backPath="/dashboard" />

      {/* Hero Search Section */}
      <div className="bg-white border-b border-slate-100 pt-8 pb-12 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900">Discover Local Guides</h2>
            <p className="text-slate-500 font-medium mt-1">
              Connect with verified experts who know the hidden gems.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-[32px] border border-slate-200 flex flex-col md:flex-row items-center gap-4">
            {/* Destination */}
            <div className="flex-1 w-full relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-tb-purple transition-colors">
                <MapPin className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Where do you need a guide?"
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 focus:border-tb-purple rounded-2xl outline-none transition-all font-semibold text-slate-700 shadow-sm"
                value={destination}
                onChange={e => setDestination(e.target.value)}
              />
            </div>

            {/* Price Filter */}
            <div className="w-full md:w-72 px-6 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Rate Limit
                </label>
                <span className="text-sm font-black text-tb-purple">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="100"
                max="5000"
                step="50"
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-tb-purple"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={handleReset}
                className="p-4 bg-white text-slate-400 rounded-2xl hover:text-tb-purple border border-slate-200 hover:border-tb-purple/20 transition-all shadow-sm"
                title="Reset Filters"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex-1 md:flex-none px-10 py-4 bg-tb-purple text-white font-bold rounded-2xl shadow-lg shadow-violet-200 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Find Guides
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-slate-400" />
            {loading ? 'Searching for experts...' : `${guides.length} Verified local experts`}
          </h3>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="h-44 bg-white animate-pulse rounded-[28px] border border-slate-100 shadow-sm"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {guides.length > 0 ? (
                guides.map(guide => <GuideCard key={guide.id} guide={guide} />)
              ) : (
                <div className="col-span-full py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-6">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Search className="w-10 h-10 text-slate-200" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">No guides found</h3>
                  <p className="text-slate-500 max-w-sm mx-auto mt-3">
                    We couldn't find any experts for this destination or price range.
                  </p>
                  <button
                    onClick={handleReset}
                    className="mt-8 text-tb-purple font-bold hover:underline"
                  >
                    View all available guides
                  </button>
                </div>
              )}
            </div>

            {/* Pagination Component */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center pb-8 border-t border-slate-100 pt-12">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={newPage => {
                    setPage(newPage);
                    window.scrollTo({ top: 300, behavior: 'smooth' });
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

export default FindGuidesPage;

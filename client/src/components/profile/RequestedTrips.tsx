import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Globe, Compass, Loader2 } from 'lucide-react';
import { connectionService } from '../../services/connection.service';
import { Pagination } from '../Pagination';
import type { ConnectionRequest } from '../../types/auth.dto';
import toast from 'react-hot-toast';

interface RequestedTripsProps {
  userId: string;
}

export const RequestedTrips: React.FC<RequestedTripsProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 4;

  const loadData = async (pageNum: number) => {
    if (!userId) return;
    try {
      if (pageNum === 1 && !paginationLoading) setLoading(true);
      else setPaginationLoading(true);

      const data = await connectionService.getSentRequests(pageNum, LIMIT);
      setRequests(data.requests);
      setTotal(data.total);
    } catch (_err) {
      console.error('Failed to load requested trips', _err);
      toast.error('Failed to load your trip requests');
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadData(page);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, page]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {requests.length > 0 ? (
        <>
          <div className="relative">
            {paginationLoading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl animate-in fade-in duration-200">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
              </div>
            )}
            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-200 ${paginationLoading ? 'opacity-40' : 'opacity-100'}`}
            >
              {requests.map(req => (
                <div
                  key={req._id}
                  onClick={() =>
                    req.tripId?._id &&
                    navigate(`/trip-details/${req.tripId._id}`, { state: { from: '/profile' } })
                  }
                  className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between hover:border-indigo-200 transition-all cursor-pointer group hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50/50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                        {req.tripId?.title || 'Trip Request'}
                      </h4>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                        {req.tripId?.destination || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span
                      className={`text-[9px] font-black uppercase tracking-tight px-2 py-1 rounded-full ${
                        req.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-600'
                          : req.status === 'rejected'
                            ? 'bg-rose-100 text-rose-600'
                            : 'bg-amber-100 text-amber-600'
                      }`}
                    >
                      {req.status}
                    </span>
                    <p className="text-[9px] text-slate-400 mt-1 font-bold">
                      sent to {(req.receiverId as { name?: string })?.name || 'Traveler'}
                    </p>
                    <span className="text-[8px] text-indigo-500 font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      View Details <Globe size={8} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Pagination
            currentPage={page}
            totalPages={Math.ceil(total / LIMIT)}
            onPageChange={p => !paginationLoading && setPage(p)}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
          <Compass className="w-10 h-10 text-slate-200 mb-3" />
          <p className="text-slate-400 text-xs">No active requests sent to other trips.</p>
        </div>
      )}
    </div>
  );
};

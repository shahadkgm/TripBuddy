import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Plane, ArrowRight, Loader2 } from 'lucide-react';
import { tripService } from '../../services/c.trip.service';
import { Pagination } from '../Pagination';
import type { ITrip } from '../../interface/ITripdetails';
import { useSocketContext } from '../../context/SocketContext';

interface LiveChatsProps {
  userId: string;
}

export const LiveChats: React.FC<LiveChatsProps> = ({ userId }) => {
  const navigate = useNavigate();
  const { unreadCounts } = useSocketContext();
  const [trips, setTrips] = useState<ITrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 4;
  const [paginationLoading, setPaginationLoading] = useState(false);

  const fetchChats = async (pageNum: number = 1) => {
    if (!userId) return;
    try {
      if (pageNum === 1 && !paginationLoading) setLoading(true);
      else setPaginationLoading(true);

      const data = await tripService.getUserTrips(userId, pageNum, LIMIT);
      setTrips(data.trips);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchChats(page);
    }
  }, [userId, page]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading your conversations...</p>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
          <MessageCircle className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">No Active Chats</h3>
        <p className="text-slate-500 text-sm max-w-xs text-center">
          Join a trip or create one to start chatting with your travel buddies!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        {paginationLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl animate-in fade-in duration-200">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
          </div>
        )}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-200 ${paginationLoading ? 'opacity-40' : 'opacity-100'}`}
        >
          {trips.map(trip => {
            const unreadCount = unreadCounts[trip._id] || 0;
            return (
              <div
                key={trip._id}
                className="group bg-white p-6 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer flex items-center justify-between relative"
                onClick={() => navigate(`/group-chat/${trip._id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Plane size={24} />
                    </div>
                    {unreadCount > 0 && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{trip.title || trip.destination}</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {new Date(trip.startDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      -
                      {new Date(trip.endDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {trip.members?.length || 0} Members
                  </span>
                  <div className="text-indigo-600 font-bold text-xs flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    Open Chat <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Pagination
        currentPage={page}
        totalPages={Math.ceil(total / LIMIT)}
        onPageChange={p => setPage(p)}
      />
    </div>
  );
};

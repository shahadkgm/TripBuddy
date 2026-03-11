import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Plane, ArrowRight, Loader2 } from 'lucide-react';
import { tripService } from '../../services/c.trip.service';
import type { ITrip } from '../../interface/ITripdetails';

interface LiveChatsProps {
    userId: string;
}

export const LiveChats: React.FC<LiveChatsProps> = ({ userId }) => {
    const navigate = useNavigate();
    const [trips, setTrips] = useState<ITrip[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const data = await tripService.getUserTrips(userId);
                setTrips(data);
            } catch (error) {
                console.error("Error fetching chats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, [userId]);

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trips.map((trip) => (
                    <div
                        key={trip._id}
                        className="group bg-white p-6 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                        onClick={() => navigate(`/group-chat/${trip._id}`)}
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <Plane size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">{trip.destination}</h4>
                                <p className="text-xs text-slate-500 font-medium">
                                    {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} -
                                    {new Date(trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {trip.members?.length || 0} Members
                            </span>
                            <div className="text-indigo-600 font-bold text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                Open Chat <ArrowRight size={14} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

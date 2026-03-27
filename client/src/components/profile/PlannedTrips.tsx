import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Globe, MapPin, Calendar, Users, Receipt, Edit3,
    ChevronDown, ChevronUp, UserCheck, Check, X, Loader2, Settings
} from 'lucide-react';
import { tripService } from '../../services/c.trip.service';
import { connectionService } from '../../services/c.connection.service';
import type { ITrip } from '../../interface/ITripdetails';
import type { ConnectionRequest } from '../../types/auth.dto';
import toast from 'react-hot-toast';

interface PlannedTripsProps {
    userId: string;
}

export const PlannedTrips: React.FC<PlannedTripsProps> = ({ userId }) => {
    const navigate = useNavigate();
    const [trips, setTrips] = useState<ITrip[]>([]);
    const [requests, setRequests] = useState<ConnectionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedTripId, setExpandedTripId] = useState<string | null>(null);

    const loadData = async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const [tripData, reqData] = await Promise.all([
                tripService.getUserTrips(userId),
                connectionService.getPendingRequests()
            ]);
            setTrips(tripData);
            setRequests(reqData);
        } catch (err) {
            console.error("Failed to load planned trips", err);
            toast.error("Failed to load your trips");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            loadData();
        }
    }, [userId]);

    const handleAcceptRequest = async (requestId: string) => {
        try {
            await connectionService.acceptRequest(requestId);
            toast.success("Request accepted!");
            loadData(); // Refresh to update members and requests
        } catch (err) {
            toast.error("Failed to accept request");
        }
    };

    const handleRejectRequest = async (requestId: string) => {
        try {
            await connectionService.rejectRequest(requestId);
            toast.success("Request rejected");
            loadData(); // Refresh
        } catch (err) {
            toast.error("Failed to reject request");
        }
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>;
    }

    return (
        <div className="space-y-6">
            {trips.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {trips.map((trip) => {
                        const isExpanded = expandedTripId === trip._id;
                        const tripRequests = requests.filter(r => r.tripId?._id === trip._id);

                        return (
                            <div
                                key={trip._id}
                                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-indigo-200 shadow-xl' : 'border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200'
                                    }`}
                            >
                                <div
                                    className="p-5 cursor-pointer"
                                    onClick={() => setExpandedTripId(isExpanded ? null : (trip._id || null))}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                                                <MapPin size={24} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-slate-800 text-lg">{trip.title}</h4>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${trip.status === 'planned' ? 'bg-indigo-100 text-indigo-600' :
                                                        trip.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                                                            'bg-slate-100 text-slate-600'
                                                        }`}>
                                                        {trip.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                                                    <span className="flex items-center gap-1.5"><Globe size={14} className="text-slate-400" /> {trip.destination}</span>
                                                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /> {new Date(trip.startDate).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="flex -space-x-2 mr-2">
                                                {trip.members?.slice(0, 3).map((member, i) => (
                                                    <img
                                                        key={i}
                                                        src={member.avatarURL || `https://ui-avatars.com/api/?name=${member.name}`}
                                                        className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm"
                                                        alt=""
                                                    />
                                                ))}
                                                {trip.members && trip.members.length > 3 && (
                                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm">
                                                        +{trip.members.length - 3}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/manage-trip/${trip._id}`);
                                                    }}
                                                    className="p-2 bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg shadow-sm border border-indigo-100 transition-colors"
                                                    title="Manage Trip"
                                                >
                                                    <Settings size={14} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/edit-trip/${trip._id}`);
                                                    }}
                                                    className="p-2 bg-white text-slate-400 hover:text-indigo-600 rounded-lg shadow-sm border border-slate-100 transition-colors"
                                                    title="Edit Trip"
                                                >
                                                    <Edit3 size={14} />
                                                </button>
                                                {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/30 animate-in slide-in-from-top-2 duration-300">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                            <div>
                                                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                                    <Users size={12} /> Trip Members ({trip.members?.length || 0})
                                                </h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {trip.members && trip.members.length > 0 ? (
                                                        trip.members.map(member => (
                                                            <div key={member._id} className="flex items-center gap-2 bg-white p-1.5 rounded-full border border-slate-100 shadow-sm pr-3">
                                                                <img src={member.avatarURL || `https://ui-avatars.com/api/?name=${member.name}`} alt="" className="w-6 h-6 rounded-full object-cover" />
                                                                <span className="text-xs font-bold text-slate-700">{member.name}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs text-slate-400 italic">No members yet</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-3 justify-center">
                                                <button
                                                    onClick={() => navigate('/expenses', { state: { tripId: trip._id, from: '/profile' } })}
                                                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all"
                                                >
                                                    <Receipt size={14} /> Expense Log
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/trip-details/${trip._id}`, { state: { from: '/profile' } })}
                                                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all"
                                                >
                                                    <Globe size={14} /> Full Trip Details
                                                </button>
                                            </div>
                                        </div>

                                        {tripRequests.length > 0 && (
                                            <div className="mt-6 pt-6 border-t border-slate-100">
                                                <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-3 flex items-center gap-2">
                                                    <UserCheck size={12} /> Pending Requests for this Trip ({tripRequests.length})
                                                </h5>
                                                <div className="space-y-2">
                                                    {tripRequests.map(req => (
                                                        <div key={req._id} className="flex items-center justify-between bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                                                            <div className="flex items-center gap-3">
                                                                <img src={req.senderId.avatarURL || `https://ui-avatars.com/api/?name=${req.senderId.name}`} alt="" className="w-8 h-8 rounded-full object-cover border border-white" />
                                                                <div>
                                                                    <p className="text-xs font-bold text-slate-800">{req.senderId.name}</p>
                                                                    <p className="text-[10px] text-slate-500">{req.senderId.email}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button onClick={() => handleAcceptRequest(req._id)} className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-100">
                                                                    <Check size={14} />
                                                                </button>
                                                                <button onClick={() => handleRejectRequest(req._id)} className="p-1.5 bg-white text-slate-400 border border-slate-200 rounded-lg hover:bg-rose-50 hover:text-rose-500 transition-colors shadow-sm">
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                    <Globe className="w-12 h-12 text-slate-200 mb-4" />
                    <p className="text-slate-400 text-sm mb-6">Start planning your dream journey today.</p>
                    <button onClick={() => navigate('/create-trip')} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100">Launch First Trip</button>
                </div>
            )}
        </div>
    );
};

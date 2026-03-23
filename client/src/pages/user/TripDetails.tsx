import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Sparkles, UserCheck, Clock, UserPlus,
    User,
    MapPin, X,
    MessageCircle, AlertCircle, Loader2
} from 'lucide-react';
import { tripService } from '../../services/c.trip.service';
import { connectionService } from '../../services/c.connection.service';
import { authService } from '../../services/c.authService';
import type { ITrip } from '../../interface/ITripdetails';
import toast from 'react-hot-toast';

const TripDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state)?.from || '/find-travelers';

    const [trip, setTrip] = useState<ITrip | null>(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<'none' | 'pending' | 'accepted' | 'rejected' | 'incoming_pending' | 'loading'>('loading');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const currentUser = authService.getCurrentUser();

    useEffect(() => {
        const loadTripData = async () => {
            if (!id) return;
            try {
                const data = await tripService.getTripById(id);
                setTrip(data);

                if (currentUser?.id && data.userId._id !== currentUser.id) {
                    const resStatus = await connectionService.getStatus(data.userId._id, data._id);
                    setStatus(resStatus || 'none');
                } else {
                    setStatus('none');
                }
            } catch (error) {
                console.error("Error loading trip details:", error);
                toast.error("Failed to load trip details");
            } finally {
                setLoading(false);
            }
        };

        loadTripData();
    }, [id, currentUser?.id]);

    const handleSendRequest = async () => {
        if (!currentUser?.id) {
            toast.error("Please login to send request");
            navigate('/login');
            return;
        }
        if (!trip) return;

        try {
            setStatus('loading');
            await connectionService.sendRequest(trip.userId._id, trip._id);
            setStatus('pending');
            toast.success("Connection request sent!");
        } catch (error) {
            toast.error("Failed to send request");
            setStatus('none');
        }
    };
    const handleFinalize = async () => {
        if (!trip || !id) return;
        try {
            // Defaulting minMembers to 2 if not set, but the owner can just finalize for now
            const deposit = trip.budget * 0.2; 
            await tripService.finalizeTrip(id, trip.budget, deposit);
            toast.success("Trip finalized! Members can now pay deposits.");
            setTrip({ ...trip, status: 'finalized', depositAmount: deposit });
        } catch (error) {
            toast.error("Failed to finalize trip");
        }
    };

    const handleCancelTrip = async () => {
        if (!id) return;
        try {
            setIsCancelling(true);
            await tripService.cancelTrip(id);
            toast.success("Trip cancelled and members refunded.");
            if (trip) setTrip({ ...trip, status: 'cancelled' });
            setShowCancelModal(false);
        } catch (error) {
            toast.error("Failed to cancel trip");
        } finally {
            setIsCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Trip not found</h2>
                <button onClick={() => navigate(from)} className="text-indigo-600 font-bold hover:underline">
                    Back
                </button>
            </div>
        );
    }

    const isOwnTrip = currentUser?.id === trip.userId._id;

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Container */}
            <div className="max-w-4xl mx-auto bg-white min-h-screen shadow-xl border-x border-slate-100 flex flex-col p-8 md:p-12">

                {/* Header Section */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-lg">
                            <MapPin className="text-white w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black text-slate-900 tracking-tight">Trip Buddy</span>
                    </div>
                    <button
                        onClick={() => navigate(from)}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-100"
                    >
                        back
                    </button>
                </div>

                {/* User Info Section */}
                <div className="flex flex-col md:flex-row gap-8 mb-10">
                    <div className="relative shrink-0">
                        <img
                            src={trip.userId.avatarURL || `https://i.pravatar.cc/300?u=${trip.userId._id}`}
                            className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] object-cover border-4 border-indigo-50 shadow-md"
                            alt={trip.userId.name}
                        />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl font-black text-slate-900 mb-2">{trip.userId.name}</h1>
                        <p className="text-slate-500 font-bold mb-4">Age: 23</p>
                        <div className="space-y-2">
                            <p className="text-slate-700 font-bold flex items-center gap-2 text-lg">
                                <span className="text-indigo-600 font-black">Destination:</span>
                                {trip.destination}
                                <span className="text-slate-400 font-medium">({new Date(trip.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} - {new Date(trip.endDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })})</span>
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-6">
                            {trip.preferences.interests.map(interest => (
                                <span key={interest} className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-100">
                                    {interest}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Travel Preferences Section */}
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-auto">
                    <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                        <Sparkles className="text-indigo-500 w-5 h-5" /> Travel Preferences
                    </h2>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between group">
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-900">Budget</span>
                                <p className="text-slate-500 font-medium mt-1">₹ {trip.budget} </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between group">
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-900">Transport</span>
                                <p className="text-slate-500 font-medium mt-1 uppercase tracking-wider">{trip.preferences.transport}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between group">
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-900">discription</span>
                                <p className="text-slate-500 font-medium mt-1">{trip.description}</p>
                            </div>
                        </div>
                        <div>
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                <User size={12} /> Trip Members ({trip.members?.length || 0})
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
                    </div>
                </div>

                {/* Action Button Section */}
                <div className="mt-12">
                    {isOwnTrip ? (
                        <div className="space-y-4">
                            {trip.status !== 'finalized' && trip.status !== 'confirmed' ? (
                                <button
                                    onClick={handleFinalize}
                                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition"
                                >
                                    Finalize Trip & Set Deposit
                                </button>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    <button
                                        disabled
                                        className="w-full py-5 bg-emerald-50 text-emerald-600 border-2 border-emerald-200 rounded-2xl font-black uppercase tracking-[0.2em]"
                                    >
                                        Trip Finalized
                                    </button>
                                        <button
                                            onClick={() => setShowCancelModal(true)}
                                            className="w-full py-4 border-2 border-rose-100 text-rose-600 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-rose-50 transition"
                                        >
                                            Cancel Trip & Refund All
                                        </button>
                                </div>
                            )}
                            <button
                                onClick={() => navigate(`/group-chat/${trip._id}`)}
                                className="w-full py-5 bg-slate-100 text-slate-700 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-200 transition"
                            >
                                <MessageCircle className="w-6 h-6" />
                                Go to Chat
                            </button>
                        </div>
                    ) : status === 'accepted' ? (
                        <div className="space-y-4">
                            <button
                                disabled
                                className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg shadow-emerald-100"
                            >
                                <UserCheck className="w-6 h-6" />
                                Connected
                            </button>
                            <button
                                onClick={() => navigate(`/group-chat/${trip._id}`)}
                                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition"
                            >
                                <MessageCircle className="w-6 h-6" />
                                message
                            </button>

                            <p className="text-center text-slate-400 text-sm font-medium italic">You are already travel buddies for this trip!</p>
                        </div>
                    ) : status === 'pending' ? (
                        <button
                            disabled
                            className="w-full py-5 bg-amber-50 text-amber-600 border-2 border-amber-200 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                        >
                            <Clock className="w-6 h-6" />
                            Request Sent
                        </button>
                    ) : status === 'rejected' ? (
                        <div className="space-y-4">
                            <button
                                disabled
                                className="w-full py-5 bg-rose-50 text-rose-600 border-2 border-rose-200 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                            >
                                <X className="w-6 h-6" />
                                Request Rejected
                            </button>
                            <p className="text-center text-slate-400 text-sm font-medium italic">Your request to join this trip was not accepted.</p>
                        </div>
                    ) : status === 'incoming_pending' ? (
                        <button
                            onClick={() => navigate('/connection-requests')}
                            className="w-full py-5 bg-indigo-100 text-indigo-700 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-indigo-200 transition shadow-lg shadow-indigo-50"
                        >
                            <UserPlus className="w-6 h-6" />
                            View Incoming Request
                        </button>
                    ) : (
                        <button
                            onClick={handleSendRequest}
                            disabled={status === 'loading'}
                            className="w-full py-5 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all transform active:scale-95 shadow-xl shadow-blue-200 flex items-center justify-center gap-3 overflow-hidden"
                        >
                            {status === 'loading' ? (
                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                "Send request"
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Cancel Trip Confirmation Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowCancelModal(false)} />
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md relative animate-in fade-in zoom-in duration-300 shadow-2xl border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                                <AlertCircle size={24} />
                            </div>
                            <button onClick={() => setShowCancelModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} className="text-slate-400" /></button>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Cancel Trip?</h2>
                        <p className="text-slate-500 text-sm mb-8 font-medium">
                            Are you sure you want to cancel this trip? <br />
                            <span className="text-rose-600 font-bold">All members will be refunded 100% of their deposits</span> to their TripBuddy Wallet. This action cannot be undone.
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleCancelTrip} 
                                disabled={isCancelling} 
                                className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-rose-700 transition shadow-xl shadow-rose-100 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {isCancelling ? <Loader2 className="animate-spin" /> : <>Yes, Cancel Trip</>}
                            </button>
                            <button 
                                onClick={() => setShowCancelModal(false)}
                                className="w-full py-4 bg-slate-50 text-slate-500 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-100 transition"
                            >
                                No, Keep Trip
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TripDetails;
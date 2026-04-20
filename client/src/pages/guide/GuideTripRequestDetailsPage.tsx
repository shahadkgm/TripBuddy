import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Sparkles, Clock, 
    MapPin, Loader2, Calendar,
    Users, Briefcase, ArrowLeft,
    CheckCircle2, XCircle, Info
} from 'lucide-react';
import { tripService } from '../../services/c.trip.service';
import { guideService } from '../../services/c.guide.service';
import { authService } from '../../services/c.authService';
import type { ITrip } from '../../interface/ITripdetails';
import toast from 'react-hot-toast';
import { GuideSidebar } from './GuideSidebar';
import { GuideHeader } from './GuideHeader';

export const GuideTripRequestDetailsPage = () => {
    const { id, invitationId } = useParams<{ id: string; invitationId: string }>();
    const navigate = useNavigate();

    const [trip, setTrip] = useState<ITrip | null>(null);
    const [loading, setLoading] = useState(true);
    const [responding, setResponding] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        const loadTripData = async () => {
            if (!id) return;
            try {
                const data = await tripService.getTripById(id);
                setTrip(data);
            } catch (error) {
                console.error("Error loading trip details:", error);
                toast.error("Failed to load trip details");
            } finally {
                setLoading(false);
            }
        };
        loadTripData();
    }, [id]);

    const handleAccept = async () => {
        if (!invitationId) {
            toast.error("Invitation ID is missing");
            return;
        }
        console.log("Responding to invitation:", invitationId);
        try {
            setResponding(true);
            await guideService.respondToInvitation(invitationId, 'accepted');
            toast.success("Assignment accepted! You are now part of this trip.");
            navigate('/guide/bookings');
        } catch (error: any) {
            console.error("Error in handleAccept:", error);
            toast.error(error.response?.data?.message || "Failed to accept assignment");
        } finally {
            setResponding(false);
        }
    };

    const handleReject = async () => {
        if (!invitationId || !rejectionReason.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }
        console.log("Rejecting invitation:", invitationId, "Reason:", rejectionReason);
        try {
            setResponding(true);
            await guideService.respondToInvitation(invitationId, 'rejected', rejectionReason);
            toast.success("Request declined.");
            navigate('/guide-dashboard');
        } catch (error: any) {
            console.error("Error in handleReject:", error);
            toast.error(error.response?.data?.message || "Failed to reject request");
        } finally {
            setResponding(false);
            setShowRejectModal(false);
        }
    };

    if (loading) {
        return (
            <div className="flex bg-slate-50 min-h-screen font-outfit">
                <GuideSidebar />
                <div className="flex-1 ml-64 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Trip Details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!trip) return null;

    return (
        <div className="flex bg-slate-50 min-h-screen font-outfit">
            <GuideSidebar />

            <div className="flex-1 ml-64 transition-all duration-300">
                <GuideHeader currentPage="Request Details" />
                <div className="p-10">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors mb-8 group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
                    </button>

                    <div className="max-w-5xl mx-auto">
                        {/* Hero Section */}
                        <div className="bg-white rounded-[2.5rem] lg:rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100 mb-10">
                            <div className="bg-gradient-to-br from-slate-900 to-indigo-900 p-8 lg:p-12 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-32 bg-indigo-500/20 rounded-full -mr-32 -mt-32 blur-3xl" />
                                <div className="relative z-10">
                                    <div className="flex flex-wrap items-center gap-3 mb-6">
                                        <span className="px-4 py-1.5 bg-indigo-500/30 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/20">
                                            New Opportunity
                                        </span>
                                        <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 flex items-center gap-2">
                                            <Clock size={12} /> {calcDays(trip.startDate, trip.endDate)} Days
                                        </span>
                                    </div>
                                    <h1 className="text-3xl lg:text-5xl font-black tracking-tighter uppercase leading-tight mb-6">
                                        {trip.title}
                                    </h1>
                                    <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 sm:gap-8 text-indigo-100/80">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={18} className="text-indigo-400" />
                                            <span className="text-xs lg:text-sm font-bold uppercase tracking-widest">{trip.destination}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={18} className="text-indigo-400" />
                                            <span className="text-xs lg:text-sm font-bold uppercase tracking-widest">
                                                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users size={18} className="text-indigo-400" />
                                            <span className="text-xs lg:text-sm font-bold uppercase tracking-widest">{trip.members?.length || 0} Travelers</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="p-8 lg:p-12">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                    <div className="lg:col-span-2 space-y-10">
                                        <div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                                                <Info size={14} className="text-indigo-500" /> About this Adventure
                                            </h3>
                                            <p className="text-sm lg:text-base text-slate-600 leading-relaxed font-medium bg-slate-50 p-6 lg:p-8 rounded-[2rem] border border-slate-100/50">
                                                {trip.description || "No description provided for this trip."}
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                                                <Sparkles size={14} className="text-indigo-500" /> Traveler Preferences
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Accommodation</p>
                                                    <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">{trip.preferences.accommodation}</p>
                                                </div>
                                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Transport</p>
                                                    <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">{trip.preferences.transport}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                                                <Briefcase size={14} className="text-indigo-500" /> Planned Itinerary
                                            </h3>
                                            <div className="space-y-4">
                                                {trip.itinerary && trip.itinerary.length > 0 ? (
                                                    trip.itinerary.map((day, idx) => (
                                                        <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
                                                            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black shrink-0 text-sm">
                                                                {idx + 1}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="text-xs lg:text-sm font-black uppercase tracking-tight mb-2">Day {idx + 1}</h4>
                                                                <div className="space-y-1.5">
                                                                    {day.activities && day.activities.length > 0 ? (
                                                                        day.activities.map((act: { time: string, activity: string }, i: number) => (
                                                                            <div key={i} className="flex gap-2 items-start text-[10px] lg:text-xs text-slate-500 font-medium leading-relaxed">
                                                                                <span className="font-bold text-indigo-500 shrink-0">{act.time}</span>
                                                                                <span>{act.activity}</span>
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <p className="text-[10px] lg:text-xs text-slate-400 italic">No activities planned for this day.</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) )
                                                ) : (
                                                    <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Itinerary is still being finalized</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="bg-slate-900 rounded-[2rem] lg:rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200/50 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500" />
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-6">Organizer Details</h3>
                                            <div className="flex items-center gap-4 mb-8">
                                                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-indigo-600 flex items-center justify-center text-xl lg:text-2xl font-black border border-white/20 overflow-hidden shadow-lg">
                                                    {typeof trip.userId !== 'string' && trip.userId.avatarURL ? (
                                                        <img src={trip.userId.avatarURL} className="w-full h-full object-cover" alt="Organizer" />
                                                    ) : (
                                                        typeof trip.userId !== 'string' ? trip.userId.name.charAt(0) : 'U'
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-base lg:text-lg font-black tracking-tight uppercase leading-tight truncate">
                                                        {typeof trip.userId !== 'string' ? trip.userId.name : 'Unknown Organizer'}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Traveler Admin</p>
                                                </div>
                                            </div>
                                            <div className="pt-6 border-t border-white/10 space-y-4">
                                                <button 
                                                    onClick={handleAccept}
                                                    disabled={responding}
                                                    className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                                                >
                                                    {responding ? <Loader2 className="animate-spin" size={16} /> : <><CheckCircle2 size={16} /> Accept Assignment</>}
                                                </button>
                                                <button 
                                                    onClick={() => setShowRejectModal(true)}
                                                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center gap-2 active:scale-95"
                                                >
                                                    <XCircle size={16} /> Decline Request
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-[2rem] lg:rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Estimated Earnings</h3>
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-3xl lg:text-4xl font-black text-slate-900">₹{((calcDays(trip.startDate, trip.endDate) ) * (authService.getCurrentUser()?.guideProfile?.hourlyRate || 0)).toLocaleString()}</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 mt-2">Based on your rate: ₹{authService.getCurrentUser()?.guideProfile?.hourlyRate}/day</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !responding && setShowRejectModal(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-300">
                        <div className="mb-8 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 shadow-sm shadow-red-100">
                                <XCircle size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter">Decline Request</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Help the traveler understand why</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Reason for Rejection</label>
                            <textarea 
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="E.g., I'm unavailable on these dates, or I don't specialize in this destination..."
                                className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all min-h-[120px] resize-none"
                            />
                        </div>

                        <div className="mt-10 flex gap-4">
                            <button 
                                onClick={() => setShowRejectModal(false)}
                                className="flex-1 py-4 px-6 rounded-2xl border-2 border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleReject}
                                disabled={responding || !rejectionReason.trim()}
                                className="flex-[2] py-4 px-6 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 disabled:opacity-50 transition-all shadow-xl shadow-slate-200"
                            >
                                {responding ? <Loader2 className="animate-spin" size={16} /> : <>Confirm Decline <XCircle size={14} /></>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const formatDate = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const calcDays = (start: string | Date, end: string | Date) => {
    const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days;
};

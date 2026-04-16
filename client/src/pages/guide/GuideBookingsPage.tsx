import React, { useState, useEffect } from "react";
import { 
    Calendar, Clock, ChevronRight, 
    Filter, Search, Loader2, CalendarCheck, MapPin, User
} from "lucide-react";
import { authService } from "../../services/c.authService";
import { tripService } from "../../services/c.trip.service";
import type { ITrip } from "../../interface/ITripdetails";
import toast from "react-hot-toast";
import { Pagination } from "../../components/Pagination";
import { GuideLayout } from "../../components/guide/GuideLayout";

export const GuideBookingsPage = () => {
    const user = authService.getCurrentUser();
    const [trips, setTrips] = useState<ITrip[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'planned' | 'ongoing' | 'completed'>('all');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const LIMIT = 5;
    const [paginationLoading, setPaginationLoading] = useState(false);

    const fetchBookings = async (pageNum: number = 1) => {
        if (!user?.guideProfile?._id) return;
        try {
            if (pageNum === 1 && !paginationLoading) setLoading(true);
            else setPaginationLoading(true);

            const data = await tripService.getGuideTrips(user.guideProfile._id, pageNum, LIMIT);
            setTrips(data.trips);
            setTotal(data.total);
        } catch (err) {
            toast.error("Failed to load bookings");
        } finally {
            setLoading(false);
            setPaginationLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings(page);
    }, [user?.guideProfile?._id, page]);

    const filteredTrips = filter === 'all' 
        ? trips 
        : trips.filter(t => t.status === filter);

    return (
        <GuideLayout>
            <div className="p-6 lg:p-10">
                <header className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Your Bookings</h1>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Manage your adventure schedule</p>
                    </div>

                    <div className="flex overflow-x-auto pb-2 lg:pb-0 items-center gap-2 lg:gap-3 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm scrollbar-hide">
                        {(['all', 'planned', 'ongoing', 'completed'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                    filter === f 
                                    ? "bg-slate-900 text-white shadow-lg" 
                                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </header>

                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Fetching your bookings...</p>
                    </div>
                ) : filteredTrips.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 gap-6 mb-10">
                            {filteredTrips.map((trip) => (
                                <div 
                                    key={trip._id} 
                                    className="group bg-white p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100/50 transition-all duration-500 flex flex-col md:flex-row items-center gap-6 lg:gap-8 overflow-hidden relative"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-500" />
                                    
                                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-slate-50 rounded-2xl lg:rounded-3xl flex flex-col items-center justify-center border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-inner z-10">
                                        <CalendarCheck size={24} />
                                    </div>

                                    <div className="flex-1 text-center md:text-left z-10">
                                        <h4 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tighter uppercase">{trip.title}</h4>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3">
                                            <span className="flex items-center gap-1.5 text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                <MapPin size={14} className="text-indigo-500" />
                                                {trip.destination}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                <Clock size={14} className="text-amber-500" />
                                                {new Date(trip.startDate).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                <User size={14} className="text-emerald-500" />
                                                {trip.preferences.travelers} Persons
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto z-10">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] shadow-sm
                                            ${trip.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 
                                              trip.status === 'ongoing' ? 'bg-blue-50 text-blue-600 animate-pulse' : 'bg-amber-50 text-amber-600'}`}>
                                            {trip.status}
                                        </span>
                                        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-slate-900 transition-colors pt-2 group-hover:translate-x-1 duration-300">
                                            Explore Trip <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center mt-12 bg-white/50 backdrop-blur-sm p-6 rounded-[2rem] border border-slate-100">
                            <Pagination 
                                totalPages={Math.ceil(total / LIMIT)} 
                                currentPage={page} 
                                onPageChange={setPage} 
                            />
                        </div>
                    </>
                ) : (
                    <div className="bg-white rounded-[2.5rem] lg:rounded-[3rem] border-2 border-dashed border-slate-100 p-12 lg:p-24 text-center shadow-xl shadow-slate-100/50">
                        <div className="w-20 h-20 lg:w-24 lg:h-24 bg-slate-50 rounded-[2rem] lg:rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <Search className="text-slate-200" size={48} />
                        </div>
                        <h4 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">No adventures found</h4>
                        <p className="text-slate-400 text-sm font-medium理论 max-w-xs mx-auto mt-4 leading-relaxed">
                            Try adjusting your filters or complete more trips to see them here!
                        </p>
                    </div>
                )}
            </div>
        </GuideLayout>
    );
};

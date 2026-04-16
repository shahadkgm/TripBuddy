import React, { useState, useEffect } from "react";
import { 
    IndianRupee, TrendingUp, Wallet, ArrowUpRight, 
    Calendar, Loader2, Download, Filter, 
    ArrowDownLeft, BarChart3
} from "lucide-react";
import { authService } from "../../services/c.authService";
import { tripService } from "../../services/c.trip.service";
import type { ITrip } from "../../interface/ITripdetails";
import toast from "react-hot-toast";
import { GuideLayout } from "../../components/guide/GuideLayout";

export const GuideEarningsPage = () => {
    const user = authService.getCurrentUser();
    const [trips, setTrips] = useState<ITrip[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEarned: 0,
        pendingPayouts: 0,
        completedTrips: 0,
        averagePerTrip: 0
    });

    useEffect(() => {
        const fetchEarnings = async () => {
            if (!user?.guideProfile?._id) return;
            try {
                const data = await tripService.getGuideTrips(user.guideProfile._id, 1, 100);
                const guideTrips = data.trips;
                setTrips(guideTrips);
                
                const completed = guideTrips.filter(t => t.status === 'completed');
                const earnings = completed.reduce((acc, trip) => {
                    const days = Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    return acc + (days * (user.guideProfile?.hourlyRate || 0));
                }, 0);

                const pending = guideTrips.filter(t => t.status === 'ongoing' || t.status === 'confirmed').reduce((acc, trip) => {
                    const days = Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    return acc + (days * (user.guideProfile?.hourlyRate || 0));
                }, 0);

                setStats({
                    totalEarned: earnings,
                    pendingPayouts: pending,
                    completedTrips: completed.length,
                    averagePerTrip: completed.length > 0 ? earnings / completed.length : 0
                });
            } catch (err) {
                toast.error("Failed to load earnings data");
            } finally {
                setLoading(false);
            }
        };
        fetchEarnings();
    }, [user?.guideProfile?._id]);

    const handleExport = () => {
        const targetTrips = trips.filter(t => t.status === 'completed' || t.status === 'ongoing');
        if (targetTrips.length === 0) {
            toast.error("No data to export");
            return;
        }

        const headers = ["Trip Title", "Destination", "End Date", "Amount (INR)", "Status"];
        const csvRows = targetTrips.map(t => [
            `"${t.title.replace(/"/g, '""')}"`,
            `"${t.destination.replace(/"/g, '""')}"`,
            new Date(t.endDate).toLocaleDateString(),
            calcDays(t.startDate, t.endDate) * (user?.guideProfile?.hourlyRate || 0),
            t.status
        ].join(","));

        const csvContent = [headers.join(","), ...csvRows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `earnings_report_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Earnings report exported!");
    };

    const handleDownloadInvoice = (trip: ITrip) => {
        const amount = calcDays(trip.startDate, trip.endDate) * (user?.guideProfile?.hourlyRate || 0);
        const content = `
TRIPBUDDY GUIDE INVOICE
=======================
Trip: ${trip.title}
Destination: ${trip.destination}
Period: ${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}
Duration: ${calcDays(trip.startDate, trip.endDate)} Days
Daily Rate: INR ${user?.guideProfile?.hourlyRate}

TOTAL PAYABLE: INR ${amount.toLocaleString()}
Status: ${trip.status === 'completed' ? 'PAID' : 'IN ESCROW / PENDING'}
-----------------------
Thank you for your service!
        `;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `invoice_${trip.title.replace(/\s+/g, '_')}.txt`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Invoice downloaded!");
    };

    return (
        <GuideLayout>
            <div className="p-6 lg:p-10">
                <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Financial Overview</h1>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Track your revenue and payouts</p>
                    </div>

                    <button 
                        onClick={handleExport}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm"
                    >
                        <Download size={16} /> Export
                    </button>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <EarningStat 
                        label="Total Revenue" 
                        value={`₹${stats.totalEarned.toLocaleString()}`} 
                        icon={<IndianRupee size={20} />} 
                        trend="+12%" 
                        color="indigo"
                    />
                    <EarningStat 
                        label="Pending Payouts" 
                        value={`₹${stats.pendingPayouts.toLocaleString()}`} 
                        icon={<Clock size={20} />} 
                        color="amber"
                    />
                    <EarningStat 
                        label="Avg. per Assignment" 
                        value={`₹${stats.averagePerTrip.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
                        icon={<TrendingUp size={20} />} 
                        color="emerald"
                    />
                    <EarningStat 
                        label="Trips Finished" 
                        value={stats.completedTrips} 
                        icon={<BarChart3 size={20} />} 
                        color="slate"
                    />
                </div>

                <div className="bg-white rounded-[2rem] lg:rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 lg:px-10 py-6 lg:py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                        <h3 className="text-[10px] lg:text-xs font-black uppercase tracking-[0.3em] text-slate-400 whitespace-nowrap">Payment History</h3>
                        <div className="flex items-center gap-2">
                            <span className="hidden sm:inline text-[10px] font-black text-slate-400 uppercase mr-2">FilterBy:</span>
                            <select className="bg-transparent text-[10px] font-black uppercase tracking-widest text-indigo-600 focus:outline-none cursor-pointer border-none shadow-none">
                                <option>All Status</option>
                                <option>Completed</option>
                                <option>Pending</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                    <th className="px-6 lg:px-10 py-6">Trip</th>
                                    <th className="px-6 lg:px-10 py-6">Date</th>
                                    <th className="px-6 lg:px-10 py-6">Amount</th>
                                    <th className="px-6 lg:px-10 py-6">Status</th>
                                    <th className="px-6 lg:px-10 py-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                                        </td>
                                    </tr>
                                ) : trips.filter(t => t.status === 'completed' || t.status === 'ongoing').length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">
                                            No payment records found
                                        </td>
                                    </tr>
                                ) : trips.filter(t => t.status === 'completed' || t.status === 'ongoing').map((trip) => (
                                    <tr key={trip._id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 lg:px-10 py-5">
                                            <p className="text-[11px] lg:text-sm font-black text-slate-900 uppercase truncate max-w-[120px] lg:max-w-[200px]">{trip.title}</p>
                                            <p className="text-[8px] lg:text-[10px] font-bold text-slate-400 mt-0.5 truncate max-w-[100px] lg:max-w-none">{trip.destination}</p>
                                        </td>
                                        <td className="px-6 lg:px-10 py-5 text-[10px] lg:text-xs font-bold text-slate-500 whitespace-nowrap">
                                            {new Date(trip.endDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 lg:px-10 py-5">
                                            <span className="text-[11px] lg:text-sm font-black text-slate-900">₹{(calcDays(trip.startDate, trip.endDate) * (user?.guideProfile?.hourlyRate || 0)).toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 lg:px-10 py-5">
                                            <span className={`px-3 py-1 rounded-lg text-[8px] lg:text-[9px] font-black uppercase tracking-widest whitespace-nowrap
                                                ${trip.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                {trip.status === 'completed' ? 'Paid' : 'Escrowed'}
                                            </span>
                                        </td>
                                        <td className="px-6 lg:px-10 py-5 text-right">
                                            <button 
                                                onClick={() => handleDownloadInvoice(trip)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                            >
                                                <Download size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </GuideLayout>
    );
};

const EarningStat = ({ label, value, icon, trend, color }: any) => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700`} />
        
        <div className={`w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-50 text-${color}-600 mb-6 relative z-10 group-hover:bg-${color}-600 group-hover:text-white transition-all duration-500`}>
            {icon}
        </div>
        
        <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <div className="flex items-center gap-3">
                <h4 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{value}</h4>
                {trend && (
                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        <ArrowUpRight size={10} /> {trend}
                    </span>
                )}
            </div>
        </div>
    </div>
);

const calcDays = (start: string | Date, end: string | Date) => {
    const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days;
};

const Clock = ({ size, className }: any) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
);

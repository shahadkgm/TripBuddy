import { useState, useEffect } from 'react';
import { CreditCard, ArrowLeft, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Navbar } from '../../components/home/Navbar';
import { MainFooter } from '../../components/MainFooter';
import api from '../../utils/api';
import { authService } from '../../services/c.authService';
import type { AuthUser } from '../../types/auth.dto';

interface PaymentData {
  _id: string;
  tripId: {
    _id: string;
    title: string;
    destination: string;
  };
  amount: number;
  status: string;
  paymentType: string;
  transactionId?: string;
  refundReason?: string;
  createdAt: string;
}

const MyPaymentsPage = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState<PaymentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<AuthUser | null>(authService.getCurrentUser());

    useEffect(() => {
        fetchMyPayments();
        fetchLatestProfile();
    }, []);

    const fetchLatestProfile = async () => {
        const currentUser = authService.getCurrentUser();
        if (currentUser?.id) {
            try {
                const profile = await authService.getProfile(currentUser.id);
                setUserProfile(profile);
            } catch (error) {
                console.error("Failed to fetch profile", error);
            }
        }
    };

    const fetchMyPayments = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/api/payments/user-payments');
            setPayments(data.data);
        } catch (error) {
            toast.error("Failed to load your payments");
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'released':
            case 'escrowed':
                return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'pending':
                return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'failed':
                return 'bg-red-50 text-red-600 border-red-100';
            case 'refunded':
                return 'bg-purple-50 text-purple-600 border-purple-100';
            default:
                return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'released':
            case 'escrowed':
                return <CheckCircle size={14} />;
            case 'pending':
                return <Clock size={14} />;
            case 'failed':
                return <XCircle size={14} />;
            case 'refunded':
                return <RotateCcw size={14} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar variant="sticky" />
            
            <main className="grow py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate('/profile')}
                        className="group flex items-center gap-2 px-4 py-2 bg-white text-slate-500 hover:text-indigo-600 rounded-full font-bold text-sm shadow-sm border border-slate-100 transition-all hover:-translate-x-1 mb-6"
                    >
                        <ArrowLeft size={16} />
                        Back to Profile
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payment History</h1>
                            <p className="text-slate-500 font-medium">Track your trip deposits and refund status</p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                                <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total Transactions</div>
                                    <div className="text-lg font-black text-slate-900">{payments.length}</div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 bg-gradient-to-br from-emerald-50/30 to-white">
                                <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
                                    <div className="font-bold">₹</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest leading-none mb-1">Wallet Balance</div>
                                    <div className="text-lg font-black text-emerald-600">₹{(userProfile?.walletBalance || 0).toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                            <p className="font-bold text-slate-400">Loading your transactions...</p>
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CreditCard size={24} className="text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">No transactions yet</h3>
                            <p className="text-slate-500 max-w-xs mx-auto mt-2">When you pay for a trip deposit, your history will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {payments.map((payment) => (
                                <div key={payment._id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-xl ${getStatusStyles(payment.status)} bg-opacity-40`}>
                                                <CreditCard size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-900">{payment.tripId?.title || 'Unknown Trip'}</h3>
                                                <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                                                    <span>{payment.paymentType.replace('_', ' ')}</span>
                                                    <span>•</span>
                                                    <span>{new Date(payment.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                </div>
                                                {payment.status === 'refunded' && payment.refundReason && (
                                                    <p className="text-xs text-purple-500 font-medium italic mt-2">
                                                        Refund Reason: {payment.refundReason}
                                                    </p>
                                                )}
                                                {payment.transactionId && (
                                                    <div className="mt-2 flex items-center gap-1.5">
                                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">ID:</span>
                                                        <code className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded italic">
                                                            {payment.transactionId}
                                                        </code>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                                            <div className="text-xl font-black text-slate-900">₹{payment.amount.toLocaleString()}</div>
                                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(payment.status)}`}>
                                                {getStatusIcon(payment.status)}
                                                {payment.status}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            
            <MainFooter />
        </div>
    );
};

export default MyPaymentsPage;

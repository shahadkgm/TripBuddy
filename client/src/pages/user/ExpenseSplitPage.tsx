import { useState, useEffect } from 'react';
import { Trash2, Plus, User, Receipt, Calculator, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { expenseService } from '../../services/c.expense.service';
import type { IExpense } from '../../services/c.expense.service';
import { tripService } from '../../services/c.trip.service';
import { authService } from '../../services/c.authService';
import { connectionService } from '../../services/c.connection.service';
import type { ITrip } from '../../interface/ITripdetails';

export const ExpenseSplitPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const stateTripId = (location.state )?.tripId;
    const from = (location.state)?.from || '/dashboard';

    const [trips, setTrips] = useState<ITrip[]>([]);
    const [selectedTripId, setSelectedTripId] = useState<string>(stateTripId || '');
    const [expenses, setExpenses] = useState<IExpense[]>([]);
    const [tripMembers, setTripMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [newExpense, setNewExpense] = useState({
        title: '',
        amount: '',
        paidBy: '',
        splitAmong: 'All' as 'All' | string[]
    });

    const currentUser = authService.getCurrentUser();

    useEffect(() => {
        loadUserTrips();
    }, []);

    const loadUserTrips = async () => {
        if (!currentUser?.id) return;
        try {
            const data = await tripService.getUserTrips(currentUser.id);
            setTrips(data);

            // If we have a stateTripId, prioritize it. Otherwise, pick the first one from the list.
            if (stateTripId) {
                setSelectedTripId(stateTripId);
            } else if (data.length > 0 && !selectedTripId) {
                setSelectedTripId(data[0]._id);
            }
        } catch (error) {
            toast.error("Failed to load trips");
        }
    };

    useEffect(() => {
        if (selectedTripId) {
            loadExpenses();
            loadTripMembers();
        }
    }, [selectedTripId]);

    const loadTripMembers = async () => {
        try {
            const members = await connectionService.getTripMembers(selectedTripId);
            setTripMembers(members);
            if (members.length > 0) {
                setNewExpense(prev => ({ ...prev, paidBy: members[0].name }));
            }
        } catch (error) {
            console.error("Failed to load trip members", error);
        }
    };

    const loadExpenses = async () => {
        try {
            setLoading(true);
            const data = await expenseService.getTripExpenses(selectedTripId);
            setExpenses(data);
        } catch (error) {
            toast.error("Failed to load expenses");
        } finally {
            setLoading(false);
        }
    };

    const calculateBalances = () => {
        const totals: Record<string, number> = {};
        expenses.forEach(exp => {
            totals[exp.paidBy] = (totals[exp.paidBy] || 0) + exp.amount;
        });
        return totals;
    };

    const handleAddExpense = async () => {
        if (!selectedTripId) return toast.error("Please select a trip first");
        if (!newExpense.title || !newExpense.amount || !newExpense.paidBy) {
            return toast.error("Please fill all fields");
        }

        try {
            const expenseData = {
                tripId: selectedTripId,
                title: newExpense.title,
                amount: parseFloat(newExpense.amount),
                paidBy: newExpense.paidBy,
            };

            const savedExpense = await expenseService.addExpense(expenseData);
            setExpenses([savedExpense, ...expenses]);
            setNewExpense({ title: '', amount: '', paidBy: '', splitAmong: 'All' });
            toast.success("Expense added!");
        } catch (error) {
            toast.error("Failed to add expense");
        }
    };

    const deleteExpense = async (id: string) => {
        try {
            await expenseService.deleteExpense(id);
            setExpenses(expenses.filter(e => e._id !== id));
            toast.success("Expense removed");
        } catch (error) {
            toast.error("Failed to remove expense");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Navigation and Trip Selector */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <button
                        onClick={() => navigate(from)}
                        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-all font-medium"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back
                    </button>

                    <div className="w-full md:w-auto flex items-center gap-3">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                            {stateTripId ? 'Trip:' : 'Select Trip:'}
                        </label>
                        {stateTripId ? (
                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 font-bold text-indigo-700 shadow-sm">
                                {trips.find(t => t._id === stateTripId)?.title || 'Loading...'}
                            </div>
                        ) : (
                            <select
                                className="bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 shadow-sm"
                                value={selectedTripId}
                                onChange={(e) => setSelectedTripId(e.target.value)}
                            >
                                {trips.map(trip => (
                                    <option key={trip._id} value={trip._id}>{trip.title}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                {/* Header */}
                <div className="text-center mb-10 pt-4">
                    <h1 className="text-4xl font-black text-indigo-600 tracking-tight">Expense Log</h1>
                    <p className="text-slate-500 font-medium mt-2">Keep your trip finances crystal clear</p>
                </div>

                {/* Add New Expense Card */}
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-indigo-50 rounded-2xl">
                            <Plus className="text-indigo-600" size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">Add New Expense</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="Expense Title (e.g. Hotel)"
                            className="p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none"
                            value={newExpense.title}
                            onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Amount (₹)"
                            className="p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none"
                            value={newExpense.amount}
                            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                        />
                        <select
                            className="p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none text-slate-600 appearance-none font-medium"
                            value={newExpense.paidBy}
                            onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })}
                        >
                            <option value="" disabled>Paid By</option>
                            {tripMembers.map(member => (
                                <option key={member._id} value={member.name}>{member.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleAddExpense}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95"
                        >
                            <Plus size={18} /> Add
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Group Expenses Table */}
                    <div className="lg:col-span-2 bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-emerald-50 rounded-2xl">
                                    <Receipt className="text-emerald-600" size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">Group Expenses</h2>
                            </div>
                            <span className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-xs font-bold">
                                {expenses.length} Total
                            </span>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                        <tr>
                                            <th className="px-8 py-5">Title</th>
                                            <th className="px-8 py-5">Amount</th>
                                            <th className="px-8 py-5">Paid By</th>
                                            <th className="px-8 py-5 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {expenses.map((exp) => (
                                            <tr key={exp._id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <span className="font-bold text-slate-700">{exp.title}</span>
                                                    <p className="text-[10px] text-slate-300 font-medium uppercase mt-1">
                                                        {new Date(exp.createdAt).toLocaleDateString()}
                                                    </p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="font-black text-indigo-600 text-lg">₹{exp.amount}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-xl text-xs font-bold border border-indigo-100">
                                                        {exp.paidBy}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button
                                                        onClick={() => deleteExpense(exp._id)}
                                                        className="text-slate-200 hover:text-rose-500 transition-all p-2 hover:bg-rose-50 rounded-xl"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {expenses.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="text-center py-20 text-slate-400 font-medium">
                                                    No expenses recorded for this trip yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Calculation Summary Card */}
                    <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden flex flex-col h-fit">
                        <Calculator className="absolute -right-8 -bottom-8 text-white/10" size={200} />
                        <div className="relative z-10">
                            <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                                <Calculator className="text-indigo-300" size={28} /> Who Owes Whom?
                            </h2>
                            <div className="space-y-6">
                                {Object.entries(calculateBalances()).map(([name, total]) => (
                                    <div key={name} className="bg-white/10 backdrop-blur-md p-5 rounded-[24px] border border-white/10 flex justify-between items-center animate-in zoom-in-95 duration-300">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider">Settlement</span>
                                            <span className="font-bold text-lg flex items-center gap-2">
                                                <User className="text-indigo-300" size={16} /> {name}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider">Receives</span>
                                            <p className="font-black text-2xl tracking-tighter">₹{total}</p>
                                        </div>
                                    </div>
                                ))}
                                {expenses.length === 0 && (
                                    <div className="py-10 text-center opacity-60 flex flex-col items-center gap-4">
                                        <Calculator size={40} className="text-white/40" />
                                        <p className="italic font-medium">Add an expense to start tracking settlements.</p>
                                    </div>
                                )}
                            </div>

                            {expenses.length > 0 && (
                                <div className="mt-10 pt-8 border-t border-white/10 flex justify-between items-center">
                                    <span className="font-bold opacity-60">Total Group Spend:</span>
                                    <span className="text-3xl font-black tracking-tighter">
                                        ₹{expenses.reduce((acc, curr) => acc + curr.amount, 0)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpenseSplitPage;

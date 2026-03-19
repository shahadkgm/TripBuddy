import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Send, X, User, ArrowLeft, AlertCircle,
    Edit, Eye, ChevronLeft, Loader2,
    Plane, Smile, Image as ImageIcon
} from 'lucide-react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { useSocket } from '../../hooks/useSocket';
import { authService } from '../../services/c.authService';
import { tripService } from '../../services/c.trip.service';
import api from '../../utils/api';
import type { ITrip } from '../../interface/ITripdetails';
import toast from 'react-hot-toast';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { paymentService } from '../../services/c.payment.service';
import type { IPayment } from '../../interface/IPayment';
import type { IMessage } from '../../interface/IMessage';

const GroupChatPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [trip, setTrip] = useState<ITrip | null>(null);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [hasPaidDeposit, setHasPaidDeposit] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [tripPayments, setTripPayments] = useState<IPayment[]>([]);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const socket = useSocket(id);
    const currentUser = authService.getCurrentUser();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const loadInitialData = async () => {
            if (!id) return;
            try {
                const [tripData, history] = await Promise.all([
                    tripService.getTripById(id),
                    tripService.getChatHistory(id)
                ]);
                setTrip(tripData);
                setMessages(history);

                if (currentUser) {
                    const myPayments = await paymentService.getMyPayments(id);
                    const paid = myPayments.some(p => p.status === 'escrowed');
                    setHasPaidDeposit(paid);
                }

                // If admin, load all payments
                if (currentUser?.id === tripData.userId._id) {
                    const allPayments = await paymentService.getTripPayments(id);
                    setTripPayments(allPayments);
                }
            } catch (error) {
                console.error("Failed to load chat data:", error);
                toast.error("Failed to load conversation");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [id, navigate, currentUser]);

    useEffect(() => {
        if (!socket) return;

        socket.on('receive_message', (message: IMessage) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socket.off('receive_message');
        };
    }, [socket]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const sessionId = queryParams.get('session_id');
        
        if (sessionId && id) {
            const verifyPayment = async () => {
                try {
                    await paymentService.verifyStripePayment({ sessionId, tripId: id });
                    setHasPaidDeposit(true);
                    toast.success("Payment verified successfully! Your spot is secured.");
                    window.history.replaceState({}, document.title, window.location.pathname);
                } catch (error) {
                    console.error("Verification error:", error);
                    toast.error("Payment verification failed or already processed.");
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            };
            verifyPayment();
        }
    }, [id]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!socket || !newMessage.trim() || !currentUser || !id) return;

        socket.emit('send_message', {
            tripId: id,
            senderId: currentUser.id,
            content: newMessage.trim(),
        });

        setNewMessage('');
    };

    const onEmojiClick = (emojiData: any) => {
        setNewMessage(prev => prev + emojiData.emoji);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !id || !currentUser) return;

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('chat', file);

            const response = await api.post('/api/chat-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const data = response.data;
            if (data.success) {
                socket?.emit('send_message', {
                    tripId: id,
                    senderId: currentUser.id,
                    content: 'Shared an image',
                    messageType: 'image',
                    fileUrl: data.data.imageUrl
                });
            } else {
                toast.error("Failed to upload image");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Error uploading image");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };
    const handlePayment = async () => {
        if (!trip || !id) return;
        
        // 20% Advance logic
        const depositAmount = trip.depositAmount || (trip.budget * 0.2);
        
        try {
            setIsProcessingPayment(true);
            const { url } = await paymentService.createStripeSession(depositAmount, id);
            if (url) {
                window.location.href = url;
            } else {
                toast.error("Failed to initiate payment");
                setIsProcessingPayment(false);
            }
        } catch (error) {
            console.error("Payment error:", error);
            toast.error("Payment failed. Please try again.");
            setIsProcessingPayment(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!trip) return null;

    const isTripAdmin = currentUser?.id === trip.userId._id;

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
            {/* Main Header / Navigation */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div 
                        className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-xl transition-colors"
                        onClick={() => setShowMembersModal(true)}
                    >
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                            <Plane size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">{trip.destination} Group</h1>
                            <p className="text-xs text-slate-500 font-medium">{trip.members?.length || 0} Members active</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowPaymentModal(true)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                            hasPaidDeposit 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse'
                        }`}
                    >
                        {hasPaidDeposit ? <ShieldCheck size={14} /> : <AlertCircle size={14} />}
                        {hasPaidDeposit ? 'Escrow Confirmed' : 'Pay Deposit'}
                    </button>
                    {isTripAdmin && (
                        <button
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-200 hover:bg-slate-200 transition-all"
                        >
                            <Edit size={14} /> Edit TripPlan
                        </button>
                    )}
                    <button
                        onClick={() => navigate(`/trip-details/${id}`)}
                        className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-indigo-100 hover:bg-indigo-100 transition-all"
                    >
                        <Eye size={14} /> View  finalize TripPlan
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full bg-white shadow-xl min-h-0 relative">
                
                {/* Payment Notice Banner */}
                {trip.status === 'finalized' && !hasPaidDeposit && !isTripAdmin && (
                    <div className="bg-indigo-600 text-white px-6 py-3 flex items-center justify-between animate-in slide-in-from-top duration-500 z-10">
                        <div className="flex items-center gap-3">
                            <CreditCard size={18} className="text-indigo-200" />
                            <p className="text-sm font-bold">
                                Trip finalized! Pay 20% deposit (₹{(trip.depositAmount || trip.budget * 0.2).toLocaleString()}) to secure your spot.
                            </p>
                        </div>
                        <button 
                            onClick={handlePayment}
                            disabled={isProcessingPayment}
                            className="bg-white text-indigo-600 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-slate-100 transition-colors shadow-sm disabled:opacity-50"
                        >
                            {isProcessingPayment ? 'Processing...' : 'Pay Now'}
                        </button>
                    </div>
                )}

                {/* Scrollable Messages Container */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-20">
                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-md">
                                <Send size={32} className="text-slate-200" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">No messages yet</h3>
                            <p className="text-sm max-w-xs mt-2 font-medium">Be the first to say hi to your fellow travelers for {trip.destination}!</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => {
                            const isOwn = msg.senderId._id === currentUser?.id;
                            const showName = index === 0 || messages[index - 1].senderId._id !== msg.senderId._id;

                            return (
                                <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`max-w-[75%] ${isOwn ? 'text-right' : 'text-left'}`}>
                                        {showName && !isOwn && (
                                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5 ml-1">
                                                {msg.senderId.name}
                                            </p>
                                        )}
                                        <div className={`
                                            relative px-5 py-3.5 shadow-sm text-sm font-medium
                                            ${isOwn
                                                ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none'
                                                : 'bg-white text-slate-800 rounded-2xl rounded-tl-none border border-slate-100'}
                                        `}>
                                            {msg.messageType === 'image' ? (
                                                <div className="space-y-2">
                                                    <img 
                                                        src={msg.fileUrl} 
                                                        alt="Sent image" 
                                                        className="max-w-full rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                                                        onClick={() => window.open(msg.fileUrl, '_blank')}
                                                    />
                                                    {msg.content !== 'Shared an image' && <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                                                </div>
                                            ) : (
                                                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                            )}
                                        </div>
                                        <p className={`text-[10px] text-slate-400 mt-1.5 font-bold ${isOwn ? 'mr-1' : 'ml-1'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white border-t border-slate-100 flex flex-col gap-4 relative">
                    {showEmojiPicker && (
                        <div className="absolute bottom-full mb-4 left-6 z-50">
                            <EmojiPicker 
                                onEmojiClick={onEmojiClick}
                                theme={Theme.LIGHT}
                                width={350}
                                height={400}
                            />
                        </div>
                    )}
                    
                    <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className={`p-3 rounded-2xl transition-all ${showEmojiPicker ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                            >
                                <Smile size={20} />
                            </button>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="p-3 bg-slate-50 text-slate-500 hover:bg-slate-100 rounded-2xl transition-all disabled:opacity-50"
                            >
                                {isUploading ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}
                            </button>
                            <input 
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                        
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onFocus={() => setShowEmojiPicker(false)}
                                placeholder="Type your message here..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!newMessage.trim() && !isUploading}
                            className="bg-indigo-600 text-white px-8 h-[54px] rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-100 flex items-center justify-center active:scale-95"
                        >
                            <Send size={20} className="mr-2" />
                            <span className="font-bold uppercase tracking-wider text-xs">Send</span>
                        </button>
                    </form>
                    <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Your messages are secure and visible only to trip members
                    </p>
                </div>
            </div>

            {/* Payment Modal / Overlay */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <div className="bg-indigo-50 p-3 rounded-2xl">
                                <CreditCard className="text-indigo-600 w-6 h-6" />
                            </div>
                            <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        <h2 className="text-2xl font-black text-slate-900 mb-2">TripBuddy Escrow</h2>
                        <p className="text-slate-500 text-sm font-medium mb-8">
                            Secure your spot for the trip to <span className="text-indigo-600 font-bold">{trip.destination}</span>. 
                            Funds are held safely until the trip begins.
                        </p>

                        <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100">
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200/50">
                                <span className="text-sm font-bold text-slate-500">Deposit Percentage</span>
                                <span className="text-sm font-black text-slate-900">20%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-500">Amount Due</span>
                                <span className="text-2xl font-black text-indigo-600">₹{(trip.depositAmount || trip.budget * 0.2).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="flex flex-col items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-1">Creator Cancel</span>
                                <span className="text-xs font-bold text-emerald-800">100% Refund</span>
                            </div>
                            <div className="flex flex-col items-center p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-1">Member Cancel</span>
                                <span className="text-xs font-bold text-amber-800">80% Refund</span>
                            </div>
                        </div>

                        {hasPaidDeposit ? (
                            <div className="w-full py-5 bg-emerald-100 text-emerald-700 rounded-2xl font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3">
                                <ShieldCheck className="w-6 h-6" />
                                Payment Verified
                            </div>
                        ) : (
                            <button
                                onClick={handlePayment}
                                disabled={isProcessingPayment}
                                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.15em] hover:bg-indigo-700 transition transform active:scale-95 shadow-xl shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {isProcessingPayment ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>Secure Your Spot</>
                                )}
                            </button>
                        )}

                        {isTripAdmin && tripPayments.length > 0 && (
                            <div className="mt-8 pt-8 border-t border-slate-100">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Payment Summary</h3>
                                <div className="space-y-3">
                                    {trip.members?.map(member => {
                                        const payment = tripPayments.find(p => p.userId._id === member._id);
                                        return (
                                            <div key={member._id} className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                                <div className="flex items-center gap-2">
                                                    <img src={member.avatarURL || `https://ui-avatars.com/api/?name=${member.name}`} className="w-6 h-6 rounded-full" alt="" />
                                                    <span className="text-xs font-bold text-slate-700">{member.name}</span>
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                                                    payment?.status === 'escrowed' 
                                                    ? 'bg-emerald-100 text-emerald-700' 
                                                    : 'bg-slate-200 text-slate-500'
                                                }`}>
                                                    {payment?.status === 'escrowed' ? 'Paid' : 'Unpaid'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        
                        {!hasPaidDeposit && !isTripAdmin && (
                            <p className="text-[10px] text-center text-slate-400 mt-6 font-bold uppercase tracking-widest">
                                Transaction secured by TripBuddy Escrow protection
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Members View Modal */}
            {showMembersModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <div className="bg-indigo-50 p-3 rounded-2xl">
                                <User className="text-indigo-600 w-6 h-6" />
                            </div>
                            <button onClick={() => setShowMembersModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        <h2 className="text-2xl font-black text-slate-900 mb-2">Group Members</h2>
                        <p className="text-slate-500 text-sm font-medium mb-6">
                            People joining the trip to <span className="text-indigo-600 font-bold">{trip.destination}</span>.
                        </p>

                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                            {trip.members?.map(member => (
                                <div key={member._id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition-all">
                                    <img 
                                        src={member.avatarURL || `https://ui-avatars.com/api/?name=${member.name}`} 
                                        alt={member.name} 
                                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-slate-900 truncate">{member.name}</h3>
                                        <p className="text-xs text-slate-500 truncate">{member.email}</p>
                                    </div>
                                    {member._id === trip.userId._id && (
                                        <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                                            Admin
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupChatPage;

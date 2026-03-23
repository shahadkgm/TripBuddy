import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Send, X, User, AlertCircle,
    Eye, ChevronLeft, Loader2,
    Plane, Smile, Image as ImageIcon, ChevronDown,
    CreditCard, ShieldCheck
} from 'lucide-react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { useSocket } from '../../hooks/useSocket';
import { authService } from '../../services/c.authService';
import { tripService } from '../../services/c.trip.service';
import api from '../../utils/api';
import type { ITrip } from '../../interface/ITripdetails';
import toast from 'react-hot-toast';
import { paymentService } from '../../services/c.payment.service';
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
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const socket = useSocket(id);
    const currentUser = authService.getCurrentUser();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const isUserScrollingUp = useRef(false);
    const isFirstLoad = useRef(true);

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        const fromBottom = scrollHeight - scrollTop - clientHeight;

        // more intentional threshold (200px)
        if (fromBottom > 200) {
            isUserScrollingUp.current = true;
            setShowScrollButton(true);
        } else {
            isUserScrollingUp.current = false;
            setShowScrollButton(false);
        }
    };

    const scrollToBottom = (force = false) => {
        setTimeout(() => {
            if (!scrollContainerRef.current) return;
            if (!force && isUserScrollingUp.current) return; 

            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: force ? 'auto' : 'smooth'
            });
        }, 50);
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
                
                // Let the messages effect handle the initial scroll
            } catch (error) {
                console.error("Failed to load chat data:", error);
                toast.error("Failed to load conversation");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [id, navigate, currentUser?.id]);

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
        if (messages.length > 0) {
            if (isFirstLoad.current) {
                isFirstLoad.current = false;
                scrollToBottom(true); // force on initial load only
                return;
            }
            scrollToBottom(false); // For new messages, only if at bottom
        }
    }, [messages]);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const sessionId = queryParams.get('session_id');
        if (sessionId && id) {
            const verifyPayment = async () => {
                try {
                    await paymentService.verifyStripePayment({ sessionId, tripId: id });
                    setHasPaidDeposit(true);
                    toast.success("Spot secured!");
                    window.history.replaceState({}, document.title, window.location.pathname);
                } catch (error) {
                    toast.error("Payment verification failed.");
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
        // When sending, force scroll to bottom
        scrollToBottom(true);
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
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                socket?.emit('send_message', {
                    tripId: id,
                    senderId: currentUser.id,
                    content: 'Shared an image',
                    messageType: 'image',
                    fileUrl: response.data.data.imageUrl
                });
                scrollToBottom(true);
            } else {
                toast.error("Failed to upload image");
            }
        } catch (error) {
            toast.error("Error uploading image");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handlePayment = async () => {
        if (!trip || !id) return;
        const depositAmount = trip.budget * 0.2;
        try {
            setIsProcessingPayment(true);
            const { url } = await paymentService.createStripeSession(depositAmount, id);
            if (url) window.location.href = url;
            else setIsProcessingPayment(false);
        } catch (error) {
            toast.error("Payment failed.");
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

    return (
        <div className="h-screen bg-slate-100 flex flex-col font-sans overflow-hidden">
            {/* Centered Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm z-20 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                            <ChevronLeft size={24} />
                        </button>
                        <div className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-xl transition-colors" onClick={() => setShowMembersModal(true)}>
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
                                hasPaidDeposit ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse'
                            }`}
                        >
                            {hasPaidDeposit ? <ShieldCheck size={14} /> : <AlertCircle size={14} />}
                            {hasPaidDeposit ? 'Escrow Confirmed' : 'Pay Deposit'}
                        </button>
                        <button onClick={() => navigate(`/trip-details/${id}`)} className="hidden md:flex px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold items-center gap-2 border border-indigo-100 hover:bg-indigo-100 transition-all">
                            <Eye size={14} /> Details
                        </button>
                    </div>
                </div>
            </div>

            {/* Centered Chat Area */}
            <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full bg-white shadow-2xl min-h-0 relative">
                <div 
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/10 relative custom-scrollbar overflow-x-hidden"
                    style={{
                        backgroundImage: `radial-gradient(#6366f1 0.4px, transparent 0.4px)`,
                        backgroundSize: '24px 24px'
                    }}
                >
                    <div className="max-w-4xl mx-auto space-y-6">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-20">
                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-md border border-slate-100">
                                    <Send size={32} className="text-slate-200" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">No messages yet</h3>
                                <p className="text-sm max-w-xs mt-2 font-medium">Say hi to your fellow travelers!</p>
                            </div>
                        ) : (
                            messages.map((msg, index) => {
                                const isOwn = msg.senderId._id === currentUser?.id;
                                const isFirstInGroup = index === 0 || messages[index - 1].senderId._id !== msg.senderId._id;
                                return (
                                    <div key={msg._id || index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${isFirstInGroup ? 'mt-8' : 'mt-1'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                        <div className={`flex items-end gap-3 max-w-[85%] sm:max-w-[75%] group`}>
                                            {!isOwn && isFirstInGroup && (
                                                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center overflow-hidden border border-indigo-100 shadow-sm">
                                                    {msg.senderId.avatarURL ? <img src={msg.senderId.avatarURL} className="w-full h-full object-cover" alt="" /> : <User className="w-4 h-4 text-indigo-400" />}
                                                </div>
                                            )}
                                            {!isOwn && !isFirstInGroup && <div className="w-8 shrink-0" />}
                                            <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                                                {isFirstInGroup && !isOwn && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{msg.senderId.name}</p>}
                                                <div className={`relative px-4 py-2.5 shadow-sm text-sm font-semibold transition-all hover:shadow-md ${isOwn ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none' : 'bg-white text-slate-800 rounded-2xl rounded-tl-none border border-slate-200/50'}`}>
                                                    {msg.messageType === 'image' ? <img src={msg.fileUrl} className="max-h-[400px] rounded-xl cursor-zoom-in" onLoad={() => scrollToBottom(false)} onClick={() => window.open(msg.fileUrl, '_blank')} alt="" /> : <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>}
                                                </div>
                                                <p className="text-[8px] text-slate-400 mt-1 font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                            {isOwn && isFirstInGroup && (
                                                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center overflow-hidden border border-indigo-100 shadow-sm">
                                                    {currentUser?.avatarURL ? <img src={currentUser.avatarURL} className="w-full h-full object-cover" alt="" /> : <User className="w-4 h-4 text-indigo-400" />}
                                                </div>
                                            )}
                                            {isOwn && !isFirstInGroup && <div className="w-8 shrink-0" />}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {showScrollButton && (
                        <button onClick={() => scrollToBottom(true)} className="fixed bottom-32 right-8 md:right-auto md:left-1/2 md:-translate-x-1/2 z-40 bg-indigo-600 text-white px-6 py-3 rounded-full shadow-2xl hover:bg-indigo-700 transition-all animate-bounce flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                            <ChevronDown size={18} /> New Messages
                        </button>
                    )}
                </div>

                {/* Centered Input Section */}
                <div className="px-6 py-6 bg-white/50 backdrop-blur-xl border-t border-slate-100 relative">
                    <div className="max-w-4xl mx-auto flex flex-col gap-4">
                        {showEmojiPicker && (
                            <div className="absolute bottom-full mb-6 left-6 z-50 shadow-2xl rounded-3xl overflow-hidden border border-slate-200 animate-in zoom-in duration-200">
                                <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.LIGHT} width={300} height={400} skinTonesDisabled searchDisabled />
                            </div>
                        )}
                        <form onSubmit={handleSendMessage} className="flex gap-4 items-center">
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${showEmojiPicker ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400 hover:text-indigo-600'}`}>
                                    <Smile size={22} strokeWidth={2.5} />
                                </button>
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-12 h-12 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-2xl flex items-center justify-center transition-all disabled:opacity-50" disabled={isUploading}>
                                    {isUploading ? <Loader2 className="animate-spin" /> : <ImageIcon size={22} strokeWidth={2.5} />}
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                            </div>
                            <div className="flex-1 relative">
                                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onFocus={() => setShowEmojiPicker(false)} placeholder="Message group..." className="w-full bg-white border-2 border-slate-100 rounded-2xl pl-6 pr-4 py-4 text-sm focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 font-bold" />
                            </div>
                            <button type="submit" disabled={!newMessage.trim() && !isUploading} className="bg-indigo-600 text-white w-14 h-14 rounded-2xl hover:bg-indigo-700 disabled:opacity-30 transition-all shadow-xl flex items-center justify-center">
                                <Send size={24} strokeWidth={2.5} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {showPaymentModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <div className="bg-indigo-50 p-3 rounded-2xl"><CreditCard className="text-indigo-600 w-6 h-6" /></div>
                            <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} className="text-slate-400" /></button>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">TripBuddy Escrow</h2>
                        <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100 flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-500">Amount Due</span>
                            <span className="text-2xl font-black text-indigo-600">₹{(trip.budget * 0.2).toLocaleString()}</span>
                        </div>
                        <button onClick={handlePayment} disabled={isProcessingPayment} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition shadow-xl disabled:opacity-50 flex items-center justify-center gap-3">
                            {isProcessingPayment ? <Loader2 className="animate-spin" /> : <>Secure Spot</>}
                        </button>
                    </div>
                </div>
            )}

            {showMembersModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <div className="bg-indigo-50 p-3 rounded-2xl"><User className="text-indigo-600 w-6 h-6" /></div>
                            <button onClick={() => setShowMembersModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} className="text-slate-400" /></button>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-6">Group Members</h2>
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                            {trip.members?.map(member => (
                                <div key={member._id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <img src={member.avatarURL || `https://ui-avatars.com/api/?name=${member.name}`} alt="" className="w-10 h-10 rounded-full object-cover shadow-sm" />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-slate-900 truncate">{member.name}</h3>
                                        <p className="text-[10px] text-slate-500 font-black uppercase">{member._id === trip.userId._id ? 'Admin' : 'Member'}</p>
                                    </div>
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

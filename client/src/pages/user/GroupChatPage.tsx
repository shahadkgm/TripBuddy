import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Send, X, User, ArrowLeft, AlertCircle,
    Edit, Eye, ChevronLeft, Loader2,
    Plane
} from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import { authService } from '../../services/c.authService';
import { tripService } from '../../services/c.trip.service';
import type { ITrip } from '../../interface/ITripdetails';
import toast from 'react-hot-toast';

interface Message {
    _id: string;
    senderId: {
        _id: string;
        name: string;
        avatarURL?: string;
    };
    content: string;
    timestamp: string;
}

const GroupChatPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [trip, setTrip] = useState<ITrip | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

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
            } catch (error) {
                console.error("Failed to load chat data:", error);
                toast.error("Failed to load conversation");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [id, navigate]);

    useEffect(() => {
        if (!socket) return;

        socket.on('receive_message', (message: Message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socket.off('receive_message');
        };
    }, [socket]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
                    <div className="flex items-center gap-3">
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
                        className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-rose-100 hover:bg-rose-100 transition-all"
                    >
                        <AlertCircle size={14} /> payment status
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
                        <Eye size={14} /> View TripPlan
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full bg-white shadow-xl min-h-0">

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
                                            <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
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
                <div className="p-6 bg-white border-t border-slate-100 flex flex-col gap-4">
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message here..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="bg-indigo-600 text-white px-8 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-100 flex items-center justify-center active:scale-95"
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
        </div>
    );
};

export default GroupChatPage;

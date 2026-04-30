import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Send,
  X,
  User,
  AlertCircle,
  Eye,
  ChevronLeft,
  Loader2,
  Plane,
  Smile,
  Image as ImageIcon,
  ChevronDown,
  Sparkles,
  CreditCard,
  ShieldCheck,
  Settings,
  Bot,
  Calendar,
  Lock,
  MapPin,
  Star,
  Clock,
} from 'lucide-react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import type { EmojiClickData } from 'emoji-picker-react';
import { useSocketContext } from '../../hooks/useSocketContext';
import { authService } from '../../services/c.authService';
import { tripService } from '../../services/c.trip.service';
import api from '../../utils/api';
import type { ITrip, IGuide } from '../../interface/ITripdetails';
import toast from 'react-hot-toast';
import { paymentService } from '../../services/c.payment.service';
import { TripStatus } from '../../constants/TripStatus';
import type { IMessage } from '../../interface/IMessage';
import { ReviewModal, ReportModal } from '../../components/guide';
import { ConfirmModal } from '../../components/ConfirmModal';

const GroupChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<ITrip | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasPaidDeposit, setHasPaidDeposit] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [showItineraryModal, setShowItineraryModal] = useState(false);
  const [finalizeData, setFinalizeData] = useState({ budget: 0, depositAmount: 0 });
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState(0);
  const [isUpdatingBudget, setIsUpdatingBudget] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
  const [recommendedGuides, setRecommendedGuides] = useState<IGuide[]>([]);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<'organizer' | 'guide'>('organizer');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ id: string; name: string; type: 'guide' | 'organizer' } | null>(null);
  const [reportedTypes, setReportedTypes] = useState<Set<'guide' | 'organizer'>>(new Set());

  const [chatPage, setChatPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const MESSAGES_LIMIT = 50;

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { socket, setCurrentChatId } = useSocketContext();
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
        behavior: force ? 'auto' : 'smooth',
      });
    }, 50);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      if (!id) return;
      try {
        const [tripData, historyRes] = await Promise.all([
          tripService.getTripById(id),
          tripService.getChatHistory(id, 1, MESSAGES_LIMIT),
        ]);
        setTrip(tripData);
        setMessages(historyRes.messages);
        setHasMoreMessages(historyRes.total > MESSAGES_LIMIT);

        if (currentUser?.id) {
          const myPayments = await paymentService.getMyPayments(id);
          const paid = myPayments.some(p => p.status === 'escrowed');
          setHasPaidDeposit(paid);
        }

        // Initialize finalizeData from trip (default deposit is 20%)
        setFinalizeData({
          budget: tripData.budget || 0,
          depositAmount: Math.round((tripData.budget || 0) * 0.2),
        });

        // Let the messages effect handle the initial scroll
      } catch (_error) {
        console.error('Failed to load chat data:', _error);
        toast.error('Failed to load conversation');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [id, navigate, currentUser?.id]);

  useEffect(() => {
    if (!id) return;
    setCurrentChatId(id);
    return () => {
      setCurrentChatId(null);
    };
  }, [id, setCurrentChatId]);

  useEffect(() => {
    if (!socket || !id) return;
    socket.emit('join_trip', id);
  }, [socket, id]);

  const loadMoreMessages = async () => {
    if (!id || isLoadingMore || !hasMoreMessages) return;

    try {
      setIsLoadingMore(true);
      const nextPage = chatPage + 1;
      const res = await tripService.getChatHistory(id, nextPage, MESSAGES_LIMIT);

      setMessages(prev => [...res.messages, ...prev]);
      setChatPage(nextPage);
      setHasMoreMessages(res.total > nextPage * MESSAGES_LIMIT);

      if (scrollContainerRef.current) {
        const prevHeight = scrollContainerRef.current.scrollHeight;
        setTimeout(() => {
          if (scrollContainerRef.current) {
            const newHeight = scrollContainerRef.current.scrollHeight;
            scrollContainerRef.current.scrollTop = newHeight - prevHeight;
          }
        }, 0);
      }
    } catch (_err) {
      toast.error('Failed to load older messages');
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!socket) return;
    const pageMessageHandler = (message: IMessage) => {
      setMessages(prev => [...prev, message]);
    };

    socket.on('receive_message', pageMessageHandler);
    return () => {
      socket.off('receive_message', pageMessageHandler);
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
          toast.success('Spot secured!');
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (_error) {
          toast.error('Payment verification failed.');
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

  const onEmojiClick = (emojiData: EmojiClickData) => {
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
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        socket?.emit('send_message', {
          tripId: id,
          senderId: currentUser.id,
          content: 'Shared an image',
          messageType: 'image',
          fileUrl: response.data.data.imageUrl,
        });
        scrollToBottom(true);
      } else {
        toast.error('Failed to upload image');
      }
    } catch (_error) {
      toast.error('Error uploading image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePayment = async () => {
    if (!trip || !id) return;
    const depositAmount = trip.depositAmount || (trip.budget * 0.2);
    try {
      setIsProcessingPayment(true);
      const { url } = await paymentService.createStripeSession(depositAmount, id);
      if (url) window.location.href = url;
      else setIsProcessingPayment(false);
    } catch (_error) {
      toast.error('Payment failed.');
      setIsProcessingPayment(false);
    }
  };

  const handleWalletPayment = async () => {
    if (!trip || !id || !currentUser) return;
    const depositAmount = trip.depositAmount || (trip.budget * 0.2);

    const currentBalance = currentUser.walletBalance || 0;
    if (currentBalance < depositAmount) {
      toast.error('Insufficient wallet balance');
      return;
    }

    try {
      setIsProcessingPayment(true);
      await paymentService.payWithWallet(id, depositAmount);

      // Refresh local user data to update wallet balance in UI
      await authService.getProfile(currentUser.id);

      setHasPaidDeposit(true);
      setShowPaymentModal(false);
      toast.success('Spot secured via wallet!');
    } catch (_error) {
      toast.error('Wallet payment failed.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleFinalizeTrip = async () => {
    if (!id || !trip) return;

    // Guide fee validation — guide is NOT a member, so only count trip.members
    const memberCount = trip.members?.length || 1;
    const guideDailyRate = trip.guideId?.dailyRate || 0;

    // Calculate total trip days
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const tripDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Including both start and end days

    const totalGuideFee = guideDailyRate * tripDays;
    const minDepositPerMember = totalGuideFee > 0 ? Math.ceil(totalGuideFee / memberCount) : 0;

    if (minDepositPerMember > 0 && finalizeData.depositAmount < minDepositPerMember) {
      toast.error(
        `Deposit must be at least ₹${minDepositPerMember} per member to cover the total guide fee (₹${guideDailyRate}/day × ${tripDays} days ÷ ${memberCount} members).`
      );
      return;
    }

    try {
      setIsFinalizing(true);
      const response = await api.post(`/api/plantrips/${id}/finalize`, finalizeData);
      if (response.data.success) {
        setTrip(response.data.data);
        setShowFinalizeModal(false);
        toast.success('Trip finalized! Members can now pay deposits.');
      }
    } catch (_error) {
      toast.error('Failed to finalize trip.');
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleEditBudget = async () => {
    if (!id || newBudget <= 0) return;
    try {
      setIsUpdatingBudget(true);
      const updatedTrip = await tripService.updateTrip(id, { budget: newBudget });
      setTrip(updatedTrip);
      setIsEditingBudget(false);
      toast.success('Budget updated successfully!');
    } catch (_error) {
      toast.error('Failed to update budget');
    } finally {
      setIsUpdatingBudget(false);
    }
  };

  const handleCompleteTrip = async () => {
    if (!id) return;

    try {
      const updatedTrip = await tripService.completeTrip(id);
      setTrip(updatedTrip);
      toast.success('Trip marked as completed!');
      setShowConfirmModal(false);
    } catch (_error) {
      toast.error('Failed to complete trip');
    }
  };

  const fetchRecommendations = async () => {
    if (!trip?.destination) return;
    try {
      setIsRecommendationsLoading(true);
      setShowRecommendationsModal(true);
      const res = await api.get('/api/guides/all', {
        params: {
          destination: trip.destination.split(',')[0], // Use major city name
          limit: 5,
        },
      });
      setRecommendedGuides(res.data.data.guides);
    } catch (_error) {
      toast.error('Failed to fetch recommendations');
    } finally {
      setIsRecommendationsLoading(false);
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

  const organizerId = typeof trip.userId === 'string' ? trip.userId : trip.userId?._id;
  const isOwner = currentUser?.id === organizerId;
  const isGuide =
    currentUser?.id ===
    (typeof trip.guideId?.userId === 'object' ? trip.guideId.userId?._id : trip.guideId?.userId);

  return (
    <div className="h-screen bg-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Centered Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm z-20 flex-shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
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
                <h1 className="text-xl font-bold text-slate-900">
                  {trip.title || `${trip.destination} Group`}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {trip.members?.length || 0} Members active
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isOwner && (
              <button
                onClick={() => navigate(`/manage-trip/${id}`)}
                className="hidden md:flex p-2 bg-indigo-50 text-indigo-600 rounded-xl items-center justify-center hover:bg-indigo-100 transition-all font-bold border border-indigo-100 shadow-sm"
                title="Manage Trip"
              >
                <Settings size={18} />
              </button>
            )}
            {trip?.status === TripStatus.PLANNED && isOwner && (
              <button
                onClick={() => setShowFinalizeModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm"
              >
                Finalize Trip
              </button>
            )}
            {/* Trip Status Badge */}
            {new Date(new Date(trip?.startDate || '').getTime() + 3 * 24 * 60 * 60 * 1000) <
              new Date() &&
              trip?.status !== TripStatus.CONFIRMED &&
              trip?.status !== TripStatus.COMPLETED &&
              trip?.status !== TripStatus.CANCELLED && (
                <div className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle size={14} /> EXPIRED
                </div>
              )}
            {trip?.status === TripStatus.PLANNED && new Date(trip?.startDate || '') >= new Date() && (
              <div className="px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-xs font-bold flex items-center gap-2">
                <Sparkles size={14} /> Awaiting Finalization
              </div>
            )}
            {trip?.status === TripStatus.FINALIZED && !isGuide && (
              <button
                onClick={() => !hasPaidDeposit && setShowPaymentModal(true)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${hasPaidDeposit
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse'
                  }`}
              >
                {hasPaidDeposit ? <ShieldCheck size={14} /> : <AlertCircle size={14} />}
                {hasPaidDeposit ? 'Spot Secured' : 'Secure Spot'}
              </button>
            )}
            {trip?.status === TripStatus.CONFIRMED && (
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-xs font-bold flex items-center gap-2">
                  <ShieldCheck size={14} /> Confirmed ✅
                </div>
                {isOwner && (
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-sm"
                  >
                    Complete Trip
                  </button>
                )}
              </div>
            )}
            {trip?.status === TripStatus.COMPLETED && (
              <button
                onClick={() => {
                  if (isOwner) {
                    if (trip.guideId) {
                      setReviewTarget('guide');
                      setShowReviewModal(true);
                    } else {
                      toast.error('No guide to review for this trip.');
                    }
                  } else {
                    setReviewTarget('organizer');
                    setShowReviewModal(true);
                  }
                }}
                className="px-4 py-2 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-amber-100 transition-all"
              >
                <Star size={14} className="fill-amber-600" />
                {isOwner ? 'Review Guide' : 'Review Trip'}
              </button>
            )}
            <button
              onClick={() => setShowItineraryModal(true)}
              className="hidden md:flex px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold items-center gap-2 border border-indigo-100 hover:bg-indigo-100 transition-all"
            >
              <Eye size={14} /> Itinerary
            </button>
            <button
              onClick={fetchRecommendations}
              className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold items-center gap-2 border border-amber-100 hover:bg-amber-100 transition-all group"
            >
              <Sparkles size={14} className="group-hover:rotate-12 transition-transform" /> Local
              Guides
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
            backgroundSize: '24px 24px',
          }}
        >
          <div className="max-w-4xl mx-auto space-y-6">
            {trip.status === TripStatus.COMPLETED && (
              <div className="mb-10 animate-in slide-in-from-top duration-700">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group border border-white/10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl" />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                        <Star className="text-amber-300 fill-amber-300" size={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white tracking-tight leading-none uppercase">
                          Adventure Complete!
                        </h3>
                        <p className="text-indigo-100/60 text-[10px] font-bold uppercase tracking-widest mt-2">
                          How was your experience with the team?
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {/* Review buttons */}
                      {!isOwner && !isGuide && (
                        <button
                          onClick={() => {
                            setReviewTarget('organizer');
                            setShowReviewModal(true);
                          }}
                          className="px-6 py-3 bg-white text-indigo-700 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 hover:text-white transition shadow-lg active:scale-95"
                        >
                          Review Trip
                        </button>
                      )}
                      {trip.guideId && !isGuide && (
                        <button
                          onClick={() => {
                            setReviewTarget('guide');
                            setShowReviewModal(true);
                          }}
                          className="px-6 py-3 bg-indigo-500 text-white border border-indigo-400 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 transition shadow-lg active:scale-95 flex items-center gap-2"
                        >
                          Review Guide
                        </button>
                      )}

                      {/* Report buttons — only after trip is completed */}
                      {trip.guideId && !isGuide && (() => {
                        const guideUserId = typeof trip.guideId?.userId === 'object'
                          ? trip.guideId.userId?._id
                          : trip.guideId?.userId;
                        const alreadyReported = reportedTypes.has('guide');
                        return (
                          <button
                            disabled={alreadyReported}
                            onClick={() => {
                              if (alreadyReported) return;
                              setReportTarget({
                                id: guideUserId || '',
                                name: trip.guideId?.name || 'Guide',
                                type: 'guide',
                              });
                              setShowReportModal(true);
                            }}
                            className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] border transition shadow-lg active:scale-95 flex items-center gap-2 ${alreadyReported
                                ? 'bg-slate-500/20 text-slate-300 border-slate-400/20 cursor-not-allowed opacity-60'
                                : 'bg-rose-500/20 text-rose-200 border border-rose-400/30 hover:bg-rose-600 hover:text-white'
                              }`}
                          >
                            {alreadyReported ? 'Reported ✓' : 'Report Guide'}
                          </button>
                        );
                      })()}
                      {!isOwner && (() => {
                        const alreadyReported = reportedTypes.has('organizer');
                        return (
                          <button
                            disabled={alreadyReported}
                            onClick={() => {
                              if (alreadyReported) return;
                              const ownerId = typeof trip.userId === 'string' ? trip.userId : trip.userId?._id;
                              const ownerName = typeof trip.userId !== 'string' ? trip.userId?.name : 'Organizer';
                              setReportTarget({
                                id: ownerId || '',
                                name: ownerName || 'Organizer',
                                type: 'organizer',
                              });
                              setShowReportModal(true);
                            }}
                            className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] border transition shadow-lg active:scale-95 flex items-center gap-2 ${alreadyReported
                                ? 'bg-slate-500/20 text-slate-300 border-slate-400/20 cursor-not-allowed opacity-60'
                                : 'bg-rose-500/20 text-rose-200 border border-rose-400/30 hover:bg-rose-600 hover:text-white'
                              }`}
                          >
                            {alreadyReported ? 'Reported ✓' : 'Report User'}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-20">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-md border border-slate-100">
                  <Send size={32} className="text-slate-200" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">No messages yet</h3>
                <p className="text-sm max-w-xs mt-2 font-medium">
                  Say hi to your fellow travelers!
                </p>
              </div>
            ) : (
              <>
                {hasMoreMessages && (
                  <div className="flex justify-center py-4">
                    <button
                      onClick={loadMoreMessages}
                      disabled={isLoadingMore}
                      className="px-6 py-2.5 bg-white border border-slate-200 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Clock size={14} />
                          Load older messages
                        </>
                      )}
                    </button>
                  </div>
                )}
                {messages.map((msg, index) => {
                  const isOwn = msg.senderId._id === currentUser?.id;
                  const isFirstInGroup =
                    index === 0 || messages[index - 1].senderId._id !== msg.senderId._id;
                  return (
                    <div
                      key={msg._id || index}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${isFirstInGroup ? 'mt-8' : 'mt-1'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                      <div className={`flex items-end gap-3 max-w-[85%] sm:max-w-[75%] group`}>
                        {!isOwn && isFirstInGroup && (
                          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center overflow-hidden border border-indigo-100 shadow-sm">
                            {msg.senderId.avatarURL ? (
                              <img
                                src={msg.senderId.avatarURL}
                                className="w-full h-full object-cover"
                                alt=""
                              />
                            ) : (
                              <User className="w-4 h-4 text-indigo-400" />
                            )}
                          </div>
                        )}
                        {!isOwn && !isFirstInGroup && <div className="w-8 shrink-0" />}
                        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                          {isFirstInGroup && !isOwn && (
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                              {msg.senderId.name}
                            </p>
                          )}
                          <div
                            className={`relative px-4 py-2.5 shadow-sm text-sm font-semibold transition-all hover:shadow-md ${isOwn ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none' : 'bg-white text-slate-800 rounded-2xl rounded-tl-none border border-slate-200/50'}`}
                          >
                            {msg.messageType === 'image' ? (
                              <img
                                src={msg.fileUrl}
                                className="max-h-[400px] rounded-xl cursor-zoom-in"
                                onLoad={() => scrollToBottom(false)}
                                onClick={() => window.open(msg.fileUrl, '_blank')}
                                alt=""
                              />
                            ) : (
                              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[8px] text-slate-400 font-black uppercase">
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            {msg.messageType !== 'image' && (
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  navigate('/ai-assistant', {
                                    state: {
                                      initialContext: `Regarding this message in the group chat: "${msg.content}"\n\nCan you help me with this?`,
                                    },
                                  });
                                }}
                                className={`p-1 rounded-full ${isOwn ? 'hover:bg-indigo-100 text-indigo-400' : 'hover:bg-slate-200 text-slate-400 hover:text-indigo-600'} transition-colors shadow-sm`}
                                title="Ask AI Assistant"
                              >
                                <Bot size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                        {isOwn && isFirstInGroup && (
                          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center overflow-hidden border border-indigo-100 shadow-sm">
                            {currentUser?.avatarURL ? (
                              <img
                                src={currentUser.avatarURL}
                                className="w-full h-full object-cover"
                                alt=""
                              />
                            ) : (
                              <User className="w-4 h-4 text-indigo-400" />
                            )}
                          </div>
                        )}
                        {isOwn && !isFirstInGroup && <div className="w-8 shrink-0" />}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {showScrollButton && (
            <button
              onClick={() => scrollToBottom(true)}
              className="fixed bottom-32 right-8 md:right-auto md:left-1/2 md:-translate-x-1/2 z-40 bg-indigo-600 text-white px-6 py-3 rounded-full shadow-2xl hover:bg-indigo-700 transition-all animate-bounce flex items-center gap-2 text-xs font-black uppercase tracking-widest"
            >
              <ChevronDown size={18} /> Scroll Down
            </button>
          )}
        </div>

        {/* Centered Input Section */}
        <div className="px-6 py-6 bg-white/50 backdrop-blur-xl border-t border-slate-100 relative">
          <div className="max-w-4xl mx-auto flex flex-col gap-4">
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-6 left-6 z-50 shadow-2xl rounded-3xl overflow-hidden border border-slate-200 animate-in zoom-in duration-200">
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  theme={Theme.LIGHT}
                  width={300}
                  height={400}
                  skinTonesDisabled
                  searchDisabled
                />
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex gap-4 items-center">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${showEmojiPicker ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400 hover:text-indigo-600'}`}
                >
                  <Smile size={22} strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-12 h-12 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-2xl flex items-center justify-center transition-all disabled:opacity-50"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <ImageIcon size={22} strokeWidth={2.5} />
                  )}
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
                  onChange={e => setNewMessage(e.target.value)}
                  onFocus={() => setShowEmojiPicker(false)}
                  placeholder="Message group..."
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl pl-6 pr-4 py-4 text-sm focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 font-bold"
                />
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim() && !isUploading}
                className="bg-indigo-600 text-white w-14 h-14 rounded-2xl hover:bg-indigo-700 disabled:opacity-30 transition-all shadow-xl flex items-center justify-center"
              >
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
              <div className="bg-indigo-50 p-3 rounded-2xl">
                <CreditCard className="text-indigo-600 w-6 h-6" />
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">TripBuddy Escrow</h2>
            <div className="bg-slate-50 rounded-3xl p-6 mb-4 border border-slate-100 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-500">Amount Due</span>
              <span className="text-2xl font-black text-indigo-600">
                ₹{(trip.depositAmount || trip.budget * 0.2).toLocaleString()}
              </span>
            </div>
            <div className="bg-indigo-50/50 rounded-2xl p-4 mb-8 border border-indigo-100/50 flex justify-between items-center">
              <span className="text-xs font-bold text-indigo-600">Your Wallet</span>
              <span className="text-sm font-black text-indigo-700">
                ₹{currentUser?.walletBalance?.toLocaleString() || 0}
              </span>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleWalletPayment}
                disabled={
                  isProcessingPayment ||
                  Math.round((currentUser?.walletBalance || 0) * 100) <
                  Math.round((trip.depositAmount || trip.budget * 0.2) * 100)
                }
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isProcessingPayment ? <Loader2 className="animate-spin" /> : <>Pay with Wallet</>}
              </button>
              <button
                onClick={handlePayment}
                disabled={isProcessingPayment}
                className="w-full py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-50 transition flex items-center justify-center gap-3"
              >
                {isProcessingPayment ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>Pay with Card/Stripe</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showMembersModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <div className="bg-indigo-50 p-3 rounded-2xl">
                <User className="text-indigo-600 w-6 h-6" />
              </div>
              <button
                onClick={() => setShowMembersModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-6">Group Members</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {trip.members?.map(member => (
                <div
                  key={member._id}
                  className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100"
                >
                  <img
                    src={member.avatarURL || `https://ui-avatars.com/api/?name=${member.name}`}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{member.name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest">
                      {(() => {
                        const guideUserId = typeof trip.guideId?.userId === 'object'
                          ? trip.guideId.userId?._id
                          : trip.guideId?.userId;
                        if (member._id === organizerId) return <span className="text-indigo-500">Admin</span>;
                        if (guideUserId && member._id === guideUserId) return <span className="text-amber-500">Guide</span>;
                        return <span className="text-slate-400">Member</span>;
                      })()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Finalize Trip Modal */}
      {showFinalizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowFinalizeModal(false)}
          />
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md relative animate-in fade-in zoom-in duration-300 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <AlertCircle size={24} />
              </div>
              <button
                onClick={() => setShowFinalizeModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Finalize Trip</h2>
            <p className="text-slate-500 text-sm mb-8 font-medium">
              Set the budget and deposit to open payments for members.
            </p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Total Budget (₹)
                </label>
                <input
                  type="number"
                  value={finalizeData.budget}
                  onChange={e => {
                    const b = Number(e.target.value);
                    setFinalizeData({ budget: b, depositAmount: Math.round(b * 0.2) });
                  }}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 transition-all font-bold text-slate-700 outline-none"
                  placeholder="e.g. 10000"
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Deposit Amount (₹)
                </label>
                <input
                  type="number"
                  value={finalizeData.depositAmount}
                  onChange={e =>
                    setFinalizeData({ ...finalizeData, depositAmount: Number(e.target.value) })
                  }
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 transition-all font-bold text-slate-700 outline-none"
                  placeholder="e.g. 2000"
                />
                {/* Guide fee hint */}
                {trip?.guideId && (() => {
                  const memberCount = trip.members?.length || 1;
                  const guideRate = trip.guideId?.dailyRate || 0;
                  const startDate = new Date(trip.startDate);
                  const endDate = new Date(trip.endDate);
                  const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
                  const totalGuideFee = guideRate * days;
                  const minPerMember = Math.ceil(totalGuideFee / memberCount);
                  const isValid = finalizeData.depositAmount >= minPerMember;
                  return (
                    <div className={`mt-3 px-4 py-3 rounded-xl text-xs font-bold flex items-start gap-2 ${isValid ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                      <span className="mt-0.5">{isValid ? '✅' : '⚠️'}</span>
                      <span>
                        Guide <strong>{trip.guideId.name}</strong> charges ₹{guideRate}/day.
                        With <strong>{memberCount} member{memberCount !== 1 ? 's' : ''}</strong> over <strong>{days} day{days !== 1 ? 's' : ''}</strong>,
                        minimum deposit is <strong>₹{minPerMember}</strong>.
                        {!isValid && <span className="block mt-0.5 text-amber-600">Current amount is below this minimum.</span>}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>

            <button
              onClick={handleFinalizeTrip}
              disabled={isFinalizing || !finalizeData.budget || !finalizeData.depositAmount}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isFinalizing ? <Loader2 className="animate-spin" /> : <>Finalize Trip Now</>}
            </button>
          </div>
        </div>
      )}

      {/* Itinerary Modal */}
      {showItineraryModal && trip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowItineraryModal(false)}
          />
          <div className="bg-white rounded-[2.5rem] p-8 max-h-[85vh] overflow-y-auto custom-scrollbar w-full max-w-xl relative animate-in fade-in zoom-in duration-300 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100/50">
                  <Calendar size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 leading-none">Trip Itinerary</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Daily Plan
                    </p>
                    <span className="text-slate-200 text-xs">•</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Total Budget:
                      </span>
                      {isEditingBudget ? (
                        <div className="flex items-center gap-1 ml-1">
                          <input
                            type="number"
                            value={newBudget}
                            onChange={e => setNewBudget(Number(e.target.value))}
                            className="w-20 px-1 py-0.5 text-xs font-bold border border-indigo-200 rounded outline-none text-slate-700 bg-indigo-50/50"
                            disabled={isUpdatingBudget}
                            autoFocus
                          />
                          <button
                            onClick={handleEditBudget}
                            disabled={isUpdatingBudget}
                            className="text-[10px] bg-indigo-600 text-white rounded px-2 py-0.5 font-bold hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {isUpdatingBudget ? '...' : 'Save'}
                          </button>
                          <button
                            onClick={() => setIsEditingBudget(false)}
                            disabled={isUpdatingBudget}
                            className="text-[10px] bg-slate-100 text-slate-600 rounded px-2 py-0.5 font-bold hover:bg-slate-200 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 ml-1">
                          <span className="text-[10px] font-black tracking-widest bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md border border-emerald-100">
                            ₹{trip.budget?.toLocaleString() || 0}
                          </span>
                          {isOwner && (
                            <button
                              onClick={() => {
                                setNewBudget(trip.budget || 0);
                                setIsEditingBudget(true);
                              }}
                              className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 underline"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowItineraryModal(false)}
                className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white">
              {isOwner || hasPaidDeposit || isGuide ? (
                <div className="p-6 space-y-6">
                  {trip.itinerary && trip.itinerary.length > 0 ? (
                    trip.itinerary.map((day, idx) => (
                      <div key={idx} className="border-l-2 border-indigo-100 pl-6 relative pb-2">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-500 border-4 border-white shadow-sm"></div>
                        <h4 className="font-black text-slate-800 tracking-tight">
                          Day {day.day}{' '}
                          <span className="text-slate-400 font-medium text-sm ml-2">
                            {new Date(day.date).toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </h4>
                        <div className="mt-4 space-y-3">
                          {day.activities.map((act, actIdx) => (
                            <div
                              key={actIdx}
                              className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col gap-1 hover:shadow-md transition-shadow group"
                            >
                              <div className="flex justify-between items-start">
                                <span className="text-sm font-bold text-slate-800 pr-4">
                                  {act.activity}
                                </span>
                                <span className="text-[10px] font-black tracking-widest uppercase text-indigo-600 bg-indigo-100 px-2 py-1 rounded-lg whitespace-nowrap">
                                  {act.time}
                                </span>
                              </div>
                              {act.location && (
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-2.5">
                                  <MapPin size={12} className="text-indigo-400" /> {act.location}
                                </span>
                              )}
                              {act.notes && (
                                <p className="text-xs text-slate-600 mt-3 italic font-medium border-t border-slate-200/50 pt-3">
                                  {act.notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">
                        No itinerary planned yet
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative min-h-[350px] bg-slate-50/30 p-6">
                  {/* Blurred Background Preview */}
                  <div className="space-y-6 filter blur-sm opacity-30 select-none pointer-events-none">
                    {[1, 2].map(i => (
                      <div key={i} className="border-l-2 border-slate-200 pl-6 relative">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-300 border-4 border-white"></div>
                        <div className="bg-slate-200 h-5 w-40 rounded-lg mb-4"></div>
                        <div className="space-y-3">
                          <div className="bg-slate-100 h-24 rounded-3xl border border-slate-200/50"></div>
                          <div className="bg-slate-100 h-20 rounded-3xl border border-slate-200/50"></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Locked Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-20 bg-white/40 backdrop-blur-[3px]">
                    <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl border border-slate-100 mb-6 text-slate-400 rotate-12 transition-transform hover:rotate-0 duration-300">
                      <Lock size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-3">
                      Itinerary Locked
                    </h3>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-[280px]">
                      The day-by-day plan is exclusively available to confirmed trip members. Secure
                      your spot to view the details!
                    </p>
                    <button
                      onClick={() => {
                        setShowItineraryModal(false);
                        setShowPaymentModal(true);
                      }}
                      className="mt-8 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all"
                    >
                      Pay Deposit
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showRecommendationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowRecommendationsModal(false)}
          />
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg relative animate-in fade-in zoom-in duration-300 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-200/50">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 leading-none">Local Experts</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1.5 flex items-center gap-1">
                    <MapPin size={10} /> Verified Guides in {trip.destination.split(',')[0]}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRecommendationsModal(false)}
                className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {isRecommendationsLoading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-3xl" />
                ))
              ) : recommendedGuides.length > 0 ? (
                recommendedGuides.map((guide, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 flex items-center gap-4 group hover:bg-white hover:shadow-lg transition-all"
                  >
                    <img
                      src={
                        guide.avatarURL ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${guide.name}`
                      }
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm"
                      alt=""
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-black text-slate-900 text-sm leading-tight truncate">
                          {guide.userId?.name || guide.name}
                        </h4>
                        <p className="font-black text-indigo-600 text-xs">
                          ₹{guide.dailyRate}
                          <small className="text-slate-400 text-[10px] font-medium">/day</small>
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium mt-1 line-clamp-2">
                        {guide.bio}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
                  <User className="text-slate-200 w-12 h-12 mb-4" />
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">
                    No guides found in this area yet
                  </p>
                </div>
              )}
            </div>

            <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-6">
              Discuss with the group to hire a guide
            </p>
          </div>
        </div>
      )}

      {showReviewModal && trip && (
        <ReviewModal
          tripId={trip._id}
          target={reviewTarget}
          targetName={
            reviewTarget === 'organizer'
              ? typeof trip.userId !== 'string'
                ? trip.userId.name
                : 'Organizer'
              : trip.guideId?.name
          }
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => { }}
        />
      )}

      {showReportModal && trip && reportTarget && (
        <ReportModal
          tripId={trip._id}
          targetId={reportTarget.id}
          targetType={reportTarget.type}
          targetName={reportTarget.name}
          onClose={() => {
            setShowReportModal(false);
            setReportTarget(null);
          }}
          onSuccess={() => {
            setReportedTypes(prev => new Set(prev).add(reportTarget.type));
            setShowReportModal(false);
            setReportTarget(null);
          }}
        />
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleCompleteTrip}
        title="Complete Trip"
        message="Are you sure you want to mark this trip as completed? This will release the escrowed funds to the organizer and guide."
        confirmText="Yes, Complete Trip"
        type="info"
      />
    </div>
  );
};

export default GroupChatPage;

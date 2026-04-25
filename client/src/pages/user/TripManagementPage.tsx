import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Settings,
  Clock,
  Sparkles,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Wand2,
  UserSearch,
  Search,
  RotateCcw,
  BadgeCheck,
  Send,
  XCircle,
} from 'lucide-react';
import { tripService } from '../../services/c.trip.service';
import { aiService } from '../../services/c.ai.service';
import { guideService } from '../../services/c.guide.service';
import { paymentService } from '../../services/c.payment.service';
import { TripStatus } from '../../constants/TripStatus';
import type { ITrip, IItineraryItem, IGuide, IGuideInvitation } from '../../interface/ITripdetails';
import type { IPayment } from '../../interface/IPayment';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { ConfirmModal } from '../../components/ConfirmModal';

const TripManagementPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<ITrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'members' | 'settings' | 'guide'>(
    'itinerary'
  );

  // Itinerary State
  const [itinerary, setItinerary] = useState<IItineraryItem[]>([]);

  // Guide Search State
  const [guides, setGuides] = useState<IGuide[]>([]);
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideDestination, setGuideDestination] = useState('');
  const [guideMaxPrice, setGuideMaxPrice] = useState(5000);
  const [assigningGuideId, setAssigningGuideId] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<IGuideInvitation[]>([]);
  const [payments, setPayments] = useState<IPayment[]>([]);

  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const getGuideInvitationStatus = (guideId: string) => {
    return invitations.find(inv => {
      const gId = typeof inv.guideId === 'string' ? inv.guideId : inv.guideId?._id;
      return gId === guideId;
    });
  };

  useEffect(() => {
    const loadTrip = async () => {
      if (!id) return;
      try {
        const data = await tripService.getTripById(id);
        setTrip(data);

        // Initialize itinerary if it exists, or create default days based on trip duration
        if (data.itinerary && data.itinerary.length > 0) {
          setItinerary(data.itinerary);
        } else {
          const days = generateDefaultItinerary(data.startDate, data.endDate);
          setItinerary(days);
        }

        // Fetch invitations for this trip
        const invRes = await api.get<{ data: { invitations: IGuideInvitation[] } }>('/api/guide-invitations/outbound');
        setInvitations(invRes.data.data.invitations.filter((inv: IGuideInvitation) => {
          const tId = typeof inv.tripId === 'string' ? inv.tripId : inv.tripId?._id;
          return tId === id;
        }));

        // Fetch payments for this trip
        const paymentsData = await paymentService.getTripPayments(id);
        setPayments(paymentsData);
      } catch (_error) {
        toast.error('Failed to load trip data');
        navigate('/profile');
      } finally {
        setLoading(false);
      }
    };
    loadTrip();
  }, [id, navigate]);

  const generateDefaultItinerary = (start: string | Date, end: string | Date): IItineraryItem[] => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const daysCount =
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const itineraryItems: IItineraryItem[] = [];
    for (let i = 0; i < daysCount; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      itineraryItems.push({
        day: i + 1,
        date: currentDate,
        activities: [],
      });
    }
    return itineraryItems;
  };

  const handleAddActivity = (dayIndex: number) => {
    const NewItinerary = [...itinerary];
    NewItinerary[dayIndex].activities.push({
      time: '12:00',
      activity: '',
      location: '',
      notes: '',
    });
    setItinerary(NewItinerary);
  };

  const handleActivityChange = (
    dayIndex: number,
    activityIndex: number,
    field: keyof IItineraryItem['activities'][0],
    value: string
  ) => {
    const NewItinerary = [...itinerary];
    const activity = NewItinerary[dayIndex].activities[activityIndex];
    (activity as Record<string, string>)[field] = value;
    setItinerary(NewItinerary);
  };

  const handleRemoveActivity = (dayIndex: number, activityIndex: number) => {
    const NewItinerary = [...itinerary];
    NewItinerary[dayIndex].activities.splice(activityIndex, 1);
    setItinerary(NewItinerary);
  };

  const handleSaveItinerary = async () => {
    if (!id) return;
    try {
      setIsSaving(true);
      await tripService.updateTrip(id, { itinerary });
      toast.success('Itinerary saved successfully!');
      setIsSaved(true);
    } catch (_error) {
      toast.error('Failed to save itinerary');
    } finally {
      setIsSaving(false);
    }
  };

  // Guide Search
  const fetchGuides = async (destination = guideDestination, maxPrice = guideMaxPrice) => {
    setGuideLoading(true);
    try {
      const res = await api.get('/api/guides/all', {
        params: { destination, maxPrice, page: 1, limit: 12 },
      });
      setGuides(res.data.data.guides);
    } catch {
      toast.error('Failed to fetch guides');
    } finally {
      setGuideLoading(false);
    }
  };

  const handleAssignGuide = async (guideId: string | null) => {
    if (!id) return;
    setAssigningGuideId(guideId);
    try {
      const updatedTrip = await tripService.assignGuide(id, guideId);
      setTrip(updatedTrip);
      toast.success(guideId ? 'Guide assigned to trip!' : 'Guide removed from trip.');
    } catch (_err: unknown) {
      const errorObj = _err as { response?: { data?: { message?: string } } };
      toast.error(errorObj?.response?.data?.message || 'Failed to update guide assignment');
    } finally {
      setAssigningGuideId(null);
    }
  };

  const handleInviteGuide = async (guideId: string) => {
    if (!id) return;
    setAssigningGuideId(guideId);
    try {
      await guideService.sendInvitation(id, guideId);
      toast.success('Trip request sent to guide!');

      // Refresh invitations
      const invRes = await api.get<{ data: { invitations: IGuideInvitation[] } }>('/api/guide-invitations/outbound');
      setInvitations(invRes.data.data.invitations.filter((inv: IGuideInvitation) => {
        const tId = typeof inv.tripId === 'string' ? inv.tripId : inv.tripId?._id;
        return tId === id;
      }));
    } catch (_err: unknown) {
      const errorObj = _err as { response?: { data?: { message?: string } } };
      toast.error(errorObj?.response?.data?.message || 'Failed to send invitation');
    } finally {
      setAssigningGuideId(null);
    }
  };

  const handleCancelTrip = async () => {
    if (!id) return;
    try {
      setIsSaving(true);
      await tripService.cancelTrip(id);
      toast.success('Trip cancelled and members refunded.');
      navigate('/profile');
    } catch (_error) {
      toast.error('Failed to cancel trip');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!id) return;
    try {
      setIsSaving(true);
      await tripService.updateTrip(id, { status: TripStatus.COMPLETED });
      toast.success('Trip marked as completed!');
      setTrip(prev => (prev ? { ...prev, status: TripStatus.COMPLETED } : null));
    } catch (_error) {
      toast.error('Failed to update status');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAIGenerateItinerary = async () => {
    if (!trip) return;

    try {
      setIsGeneratingAI(true);
      const prompt = `Act as an expert travel planner. Generate a detailed, day-by-day itinerary for a trip to ${trip.destination} from ${new Date(trip.startDate).toLocaleDateString()} to ${new Date(trip.endDate).toLocaleDateString()}.
            
The travelers are interested in: ${trip.preferences?.interests?.join(', ') || 'general sightseeing'}.
They prefer ${trip.preferences?.transport || 'any'} transport and ${trip.preferences?.accommodation || 'any'} accommodation.

Return ONLY a valid JSON array of objects representing the days. Each object must follow this exact structure:
[
  {
    "day": 1,
    "activities": [
      {
        "time": "09:00",
        "activity": "Detailed activity description",
        "location": "Specific location or venue name",
        "notes": "Any helpful tips or context"
      }
    ]
  }
]
Do not include any other text, markdown formatting, or code blocks outside the JSON array. Return raw JSON.`;

      const responseText = await aiService.getChatResponse(prompt);

      let jsonString = responseText;
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/```json\n/g, '').replace(/\n```/g, '');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/```\n/g, '').replace(/\n```/g, '');
      }

      const generatedData = JSON.parse(jsonString);

      interface AIGeneratedDay {
        activities?: {
          time?: string;
          activity?: string;
          location?: string;
          notes?: string;
        }[];
      }

      const newItinerary: IItineraryItem[] = generatedData.map((dayData: AIGeneratedDay, index: number) => {
        const currentDate = new Date(trip.startDate);
        currentDate.setDate(currentDate.getDate() + index);

        return {
          day: index + 1,
          date: currentDate,
          activities: (dayData.activities || []).map((act) => ({
            time: act.time || '10:00',
            activity: act.activity || 'Activity',
            location: act.location || '',
            notes: act.notes || '',
          })),
        };
      });

      setItinerary(newItinerary);
      toast.success('AI generated a brilliant itinerary!');
    } catch (_error) {
      toast.error('Failed to generate itinerary. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Dynamic Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 shadow-sm backdrop-blur-md bg-white/80">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-slate-100"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
                {trip.title}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border border-indigo-100/50">
                  Owner Access
                </span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-500 text-xs font-bold flex items-center gap-1">
                  <MapPin size={12} /> {trip.destination}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveItinerary}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              disabled={isSaving}
              className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all flex items-center gap-2 ${
                isSaved && !isHovering
                  ? 'bg-emerald-500 text-white shadow-emerald-100 cursor-default'
                  : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-slate-900 active:scale-95'
              }`}
            >
              {isSaving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : isSaved && !isHovering ? (
                <CheckCircle2 size={14} className="animate-in zoom-in duration-300" />
              ) : (
                <Save size={14} />
              )}
              {isSaving ? 'Saving...' : isSaved && !isHovering ? 'Saved!' : 'Save Plan'}
            </button>
          </div>
        </div>
      </div>

      {/* Expiry Warning */}
      {trip &&
        new Date(new Date(trip.startDate).getTime() + 3 * 24 * 60 * 60 * 1000) < new Date() &&
        trip.status !== TripStatus.CONFIRMED &&
        trip.status !== TripStatus.COMPLETED && (
          <div className="bg-rose-50 border-b border-rose-100 px-6 py-3">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3 text-rose-600">
                <Clock size={16} className="animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-widest">
                  This trip has expired! The scheduled dates have passed.
                </span>
              </div>
              <p className="text-[10px] text-rose-500 font-bold italic">
                Update the dates in "Management" to renew/reschedule.
              </p>
            </div>
          </div>
        )}

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1 space-y-2">
            {[
              { id: 'itinerary', label: 'Itinerary Builder', icon: Calendar },
              { id: 'members', label: 'Trip Members', icon: Users },
              { id: 'guide', label: 'Find Guide', icon: UserSearch },
              { id: 'settings', label: 'Management', icon: Settings },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'itinerary' | 'members' | 'settings' | 'guide')}
                className={`w-full flex items-center justify-between p-4 rounded-3xl transition-all border-2 ${
                  activeTab === tab.id
                    ? 'bg-white border-indigo-600 shadow-xl shadow-indigo-100/20 text-indigo-700'
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-white hover:border-slate-100'
                } group`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2.5 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-indigo-50' : 'bg-slate-50 group-hover:bg-indigo-50'}`}
                  >
                    <tab.icon
                      size={20}
                      className={
                        activeTab === tab.id
                          ? 'text-indigo-600'
                          : 'text-slate-400 group-hover:text-indigo-600'
                      }
                    />
                  </div>
                  <span className="font-black uppercase tracking-widest text-[11px]">
                    {tab.label}
                  </span>
                </div>
                <ChevronRight
                  size={16}
                  className={`transition-transform duration-300 ${activeTab === tab.id ? 'translate-x-1' : 'opacity-0'}`}
                />
              </button>
            ))}

            <div className="mt-12 bg-white/50 border border-slate-100 rounded-[2.5rem] p-6 backdrop-blur-sm">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-2">
                Quick Summary
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-2xl bg-white border border-slate-50">
                  <span className="text-xs font-bold text-slate-500">Total Budget</span>
                  <span className="text-sm font-black text-slate-900">
                    ₹{trip.budget?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-2xl bg-white border border-slate-50">
                  <span className="text-xs font-bold text-slate-500">Status</span>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md">
                    {trip.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {activeTab === 'itinerary' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-indigo-50/50 p-6 rounded-[2.5rem] border border-indigo-100/50 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-all group-hover:bg-purple-500/20"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none transition-all group-hover:bg-indigo-500/20"></div>

                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-indigo-100 flex-shrink-0 text-indigo-600">
                      <Wand2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-indigo-950 tracking-tight">
                        AI Itinerary Generator
                      </h3>
                      <p className="text-[11px] text-indigo-600/70 font-bold uppercase tracking-widest mt-1">
                        Let Trip Buddy automatically plan your trip
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleAIGenerateItinerary}
                    disabled={isGeneratingAI || isSaving}
                    className="relative z-10 flex w-full md:w-auto items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  >
                    {isGeneratingAI ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Wand2 size={16} />
                    )}
                    {isGeneratingAI ? 'Generating Magic...' : 'Auto-Generate Plan'}
                  </button>
                </div>
                {itinerary.map((day, dayIdx) => (
                  <div
                    key={dayIdx}
                    className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500"
                  >
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-3xl flex flex-col items-center justify-center shadow-lg border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                          <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                            Day
                          </span>
                          <span className="text-2xl font-black leading-none mt-1">{day.day}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-900 tracking-tighter">
                            {new Date(day.date).toLocaleDateString(undefined, {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </h3>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                            Plan your activities for today
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddActivity(dayIdx)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-100 hover:border-indigo-600 hover:text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-sm"
                      >
                        <Plus size={14} /> Add Event
                      </button>
                    </div>

                    <div className="p-8 space-y-4">
                      {day.activities.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/20">
                          <Sparkles className="text-slate-200 w-12 h-12 mb-4" />
                          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest italic">
                            No activities planned yet
                          </p>
                        </div>
                      ) : (
                        day.activities.map((activity, actIdx) => (
                          <div
                            key={actIdx}
                            className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col md:flex-row gap-6 relative group/act hover:bg-white hover:shadow-lg transition-all"
                          >
                            <div className="w-full md:w-32">
                              <div className="relative">
                                <Clock
                                  className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400"
                                  size={16}
                                />
                                <input
                                  type="time"
                                  value={activity.time}
                                  onChange={e =>
                                    handleActivityChange(dayIdx, actIdx, 'time', e.target.value)
                                  }
                                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                />
                              </div>
                            </div>
                            <div className="flex-1 space-y-4">
                              <input
                                type="text"
                                placeholder="What's the plan?"
                                value={activity.activity}
                                onChange={e =>
                                  handleActivityChange(dayIdx, actIdx, 'activity', e.target.value)
                                }
                                className="w-full px-5 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-700"
                              />
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                  <MapPin
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                                    size={14}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Location (optional)"
                                    value={activity.location}
                                    onChange={e =>
                                      handleActivityChange(
                                        dayIdx,
                                        actIdx,
                                        'location',
                                        e.target.value
                                      )
                                    }
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                  />
                                </div>
                                <input
                                  type="text"
                                  placeholder="Notes..."
                                  value={activity.notes}
                                  onChange={e =>
                                    handleActivityChange(dayIdx, actIdx, 'notes', e.target.value)
                                  }
                                  className="w-full px-4 py-2.5 bg-white/50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveActivity(dayIdx, actIdx)}
                              className="absolute -top-3 -right-3 md:top-6 md:right-6 w-10 h-10 bg-white text-slate-300 hover:text-rose-500 hover:border-rose-100 border border-slate-100 rounded-2xl flex items-center justify-center transition-all shadow-md opacity-0 group-hover/act:opacity-100"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'members' && (
              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-8 flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                    <Users size={24} />
                  </div>
                  Trip Participants
                </h3>
                <div className="space-y-4">
                  {trip.members?.map(member => (
                    <div
                      key={member._id}
                      className="flex items-center justify-between p-6 rounded-3xl border border-slate-100 bg-slate-50/20 hover:bg-white hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center gap-5">
                        <div className="relative">
                          <img
                            src={
                              member.avatarURL || `https://ui-avatars.com/api/?name=${member.name}`
                            }
                            className="w-14 h-14 rounded-2xl object-cover shadow-md"
                            alt=""
                          />
                          {member._id ===
                            (typeof trip.userId === 'string' ? trip.userId : trip.userId._id) && (
                            <div className="absolute -top-2 -right-2 bg-indigo-600 text-white p-1 rounded-lg border-2 border-white">
                              <ShieldCheck size={12} />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-800 tracking-tight">
                            {member.name}
                          </h4>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                            Payment Status
                          </span>
                          {(() => {
                            const memberPayment = payments.find(p => p.userId._id === member._id);
                            if (!memberPayment) {
                              return (
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100">
                                  <Clock size={10} /> Pending
                                </div>
                              );
                            }

                            const statusColors: Record<string, string> = {
                              escrowed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                              pending: 'bg-amber-50 text-amber-600 border-amber-100',
                              released: 'bg-indigo-50 text-indigo-600 border-indigo-100',
                              refunded: 'bg-rose-50 text-rose-600 border-rose-100',
                              failed: 'bg-red-50 text-red-600 border-red-100',
                            };

                            const statusIcons: Record<string, React.ReactNode> = {
                              escrowed: <CheckCircle2 size={10} />,
                              pending: <Clock size={10} />,
                              released: <BadgeCheck size={10} />,
                              refunded: <RotateCcw size={10} />,
                              failed: <XCircle size={10} />,
                            };

                            return (
                              <div
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[memberPayment.status] || 'bg-slate-50 text-slate-400 border-slate-100'}`}
                              >
                                {statusIcons[memberPayment.status] || <Clock size={10} />}{' '}
                                {memberPayment.status}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'guide' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                {/* Assigned Guide Card */}
                {trip.guideId && (
                  <div className="bg-white rounded-[3rem] border-2 border-indigo-100 shadow-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                        <BadgeCheck size={22} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tighter">
                        Assigned Guide
                      </h3>
                    </div>
                    <div className="flex items-start gap-5">
                      <img
                        src={
                          trip.guideId.avatarURL ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${trip.guideId.name}`
                        }
                        alt={trip.guideId.name}
                        className="w-20 h-20 rounded-2xl object-cover border-4 border-indigo-100 shadow-md flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-black text-slate-900 text-lg tracking-tight">
                              {trip.guideId.name}
                            </h4>
                            <p className="text-indigo-600 font-bold text-sm flex items-center gap-1 mt-0.5">
                              <MapPin size={12} /> {trip.guideId.serviceArea}
                            </p>
                          </div>
                          <span className="text-xl font-black text-indigo-600">
                            ₹{trip.guideId.dailyRate}
                            <small className="text-xs text-slate-400 font-normal">/day</small>
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                          {trip.guideId.bio}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {trip.guideId.specialties?.map(s => (
                            <span
                              key={s}
                              className="text-[10px] uppercase tracking-wider font-bold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg border border-indigo-100"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAssignGuide(null)}
                      disabled={assigningGuideId === null && assigningGuideId !== undefined}
                      className="mt-6 w-full py-3 rounded-2xl border-2 border-dashed border-rose-200 text-rose-400 hover:bg-rose-50 hover:border-rose-400 font-black uppercase tracking-widest text-[11px] transition-all"
                    >
                      Remove Guide from Trip
                    </button>
                  </div>
                )}

                {/* Guide Search */}
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8">
                  <h3 className="text-xl font-black text-slate-900 tracking-tighter mb-6 flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                      <UserSearch size={22} />
                    </div>
                    Available Local Guides
                  </h3>

                  {/* Recommended Guides Section */}
                  <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4 px-2">
                      <Sparkles className="text-amber-500" size={16} />
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Recommended for {trip.destination}
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {guides
                        .filter(g =>
                          g.serviceArea?.toLowerCase().includes(trip.destination?.toLowerCase())
                        )
                        .slice(0, 3)
                        .map(guide => {
                          const guideId = (guide._id || guide.id) as string;
                          const isAssigned = Boolean(trip.guideId && trip.guideId._id === guideId);
                          const latestInv = getGuideInvitationStatus(guideId);
                          return (
                            <div
                              key={guideId}
                              className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100 flex flex-col gap-3 group/rec"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={
                                    guide.avatarURL ||
                                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${guide.name}`
                                  }
                                  className="w-10 h-10 rounded-xl object-cover"
                                  alt=""
                                />
                                <div className="flex-1">
                                  <h5 className="text-xs font-black text-slate-900 leading-none">
                                    {guide.userId?.name || guide.name}
                                  </h5>
                                  <p className="text-[9px] font-bold text-indigo-500 uppercase mt-1">
                                    ₹{guide.dailyRate}/day
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => handleAssignGuide(isAssigned ? null : guideId)}
                                className={`w-full py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                  isAssigned
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-600 hover:text-indigo-600'
                                }`}
                              >
                                {isAssigned ? 'Assigned' : 'Select Guide'}
                              </button>

                              {latestInv?.status === 'rejected' && (
                                <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl">
                                  <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <XCircle size={10} /> Rejected
                                  </p>
                                  <p className="text-[9px] text-rose-500 italic font-medium line-clamp-2">
                                    "{latestInv.rejectionReason}"
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      {guides.filter(g =>
                        g.serviceArea?.toLowerCase().includes(trip.destination?.toLowerCase())
                      ).length === 0 && (
                        <div className="col-span-full py-6 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">
                            No locals matched currently
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-slate-50 mb-8" />

                  {/* Filters */}
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                      <MapPin
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={16}
                      />
                      <input
                        type="text"
                        placeholder="Filter by service area..."
                        value={guideDestination}
                        onChange={e => setGuideDestination(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                    </div>
                    <div className="w-full md:w-64 px-5 py-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-center">
                      <div className="flex justify-between mb-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Max Rate
                        </label>
                        <span className="text-xs font-black text-indigo-600">
                          ₹{guideMaxPrice}/day
                        </span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="10000"
                        step="50"
                        value={guideMaxPrice}
                        onChange={e => setGuideMaxPrice(Number(e.target.value))}
                        className="w-full h-1.5 accent-indigo-600"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setGuideDestination('');
                          setGuideMaxPrice(5000);
                          fetchGuides('', 5000);
                        }}
                        className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all"
                        title="Reset"
                      >
                        <RotateCcw size={18} />
                      </button>
                      <button
                        onClick={() => fetchGuides()}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100"
                      >
                        <Search size={14} /> Search
                      </button>
                    </div>
                  </div>

                  {/* Lazy load guides on tab open */}
                  {guides.length === 0 && !guideLoading && (
                    <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl">
                      <UserSearch className="text-slate-200 w-12 h-12 mb-3" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                        Click Search to find guides
                      </p>
                    </div>
                  )}

                  {guideLoading ? (
                    <div className="grid grid-cols-1 gap-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-28 bg-slate-50 animate-pulse rounded-3xl" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {guides.map((guide: IGuide) => {
                        const guideId = (guide._id || guide.id) as string;
                        const isAssigned = Boolean(trip.guideId && trip.guideId._id === guideId);
                        const isLoading = assigningGuideId === guideId;
                        const latestInv = getGuideInvitationStatus(guideId);

                        return (
                          <div
                            key={guide._id || guide.id}
                            className={`flex items-start gap-5 p-6 rounded-3xl border-2 transition-all ${isAssigned ? 'border-indigo-200 bg-indigo-50/40' : 'border-slate-100 bg-white hover:border-indigo-100 hover:shadow-md'}`}
                          >
                            <img
                              src={
                                guide.avatarURL
                                  ? guide.avatarURL.startsWith('http')
                                    ? guide.avatarURL
                                    : `${import.meta.env.VITE_API_URL || ''}${guide.avatarURL}`
                                  : `https://api.dicebear.com/7.x/avataaars/svg?seed=${guide.name || 'guide'}`
                              }
                              className="w-16 h-16 rounded-2xl object-cover border-4 border-slate-100 flex-shrink-0"
                              alt={guide.name}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-black text-slate-900 tracking-tight">
                                    {guide.userId?.name || guide.name}
                                  </h4>
                                  <p className="text-indigo-600 font-bold text-xs flex items-center gap-1 mt-0.5">
                                    <MapPin size={11} />
                                    {guide.serviceArea}
                                  </p>
                                </div>
                                <span className="font-black text-indigo-600 text-base whitespace-nowrap">
                                  ₹{guide.dailyRate}
                                  <small className="text-slate-400 text-xs font-normal">/day</small>
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                                {guide.bio}
                              </p>

                              {latestInv?.status === 'rejected' && (
                                <div className="mt-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                                  <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <XCircle size={12} /> Guide Declined Request
                                  </p>
                                  <p className="text-xs text-rose-500 italic font-medium">
                                    "{latestInv.rejectionReason || 'No reason provided'}"
                                  </p>
                                </div>
                              )}

                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {guide.specialties?.slice(0, 3).map((s: string) => (
                                  <span
                                    key={s}
                                    className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                if (isAssigned) {
                                  handleAssignGuide(null);
                                } else if (!latestInv || latestInv.status === 'rejected') {
                                  handleInviteGuide(guideId);
                                }
                              }}
                              disabled={isLoading || latestInv?.status === 'pending'}
                              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${
                                isAssigned
                                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                  : latestInv?.status === 'pending'
                                    ? 'bg-amber-50 text-amber-600 border border-amber-100 cursor-default'
                                    : 'bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-100'
                              }`}
                            >
                              {isLoading ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : isAssigned ? (
                                <>
                                  <CheckCircle2 size={13} /> Assigned
                                </>
                              ) : latestInv?.status === 'pending' ? (
                                <>
                                  <Clock size={13} /> Requested
                                </>
                              ) : latestInv?.status === 'rejected' ? (
                                <>
                                  <RotateCcw size={13} /> Try Again
                                </>
                              ) : (
                                <>
                                  <Send size={13} /> Invite
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-10">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-8">
                    Danger Zone
                  </h3>
                  <div className="space-y-6">
                    <div className="p-8 rounded-[2rem] border-2 border-dashed border-rose-100 bg-rose-50/30 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div>
                        <h4 className="text-lg font-black text-rose-600 tracking-tight">
                          Cancel Entire Trip
                        </h4>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          This will refund all members 100% and notify them immediately.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowCancelConfirm(true)}
                        disabled={isSaving}
                        className="px-8 py-3.5 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-rose-100 hover:bg-slate-900 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        Cancel Trip
                      </button>
                    </div>

                    <ConfirmModal
                      isOpen={showCancelConfirm}
                      onClose={() => setShowCancelConfirm(false)}
                      onConfirm={handleCancelTrip}
                      title="Cancel Entire Trip"
                      message="Are you sure you want to cancel this trip? This will refund all members 100% and cannot be undone."
                      confirmText="Yes, Cancel Trip"
                      type="danger"
                    />

                    {/* <div className="p-8 rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div>
                        <h4 className="text-lg font-black text-slate-800 tracking-tight">Post-Trip Archive</h4>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          Mark this trip as completed to move it to history.
                        </p>
                      </div>
                      <button 
                                                onClick={handleMarkCompleted}
                                                disabled={isSaving}
                                                className="px-8 py-3.5 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-slate-100 transition-all hover:bg-emerald-600 disabled:opacity-50"
                                            >
                                                Mark Completed
                                            </button>
                    </div> */}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const ShieldCheck = ({ size }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <path d="m9 12 2 2 4-4"></path>
  </svg>
);

export default TripManagementPage;

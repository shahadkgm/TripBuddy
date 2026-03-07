import { useNavigate } from 'react-router-dom';
import type { ConnectionRequest } from '../../types/auth.dto';
import {
    User, Mail, MapPin, Camera,
    Shield, LogOut,
    ArrowLeft, UserCheck, Plane,
    Loader2, Edit3, Globe, Compass, Image as ImageIcon,
    Users, Receipt, ChevronDown, ChevronUp, Check, X, Lock,ShieldQuestion
} from 'lucide-react';
import { authService } from '../../services/c.authService';
import { connectionService } from '../../services/c.connection.service';
import { tripService } from '../../services/c.trip.service';
import api from '../../utils/api';
import { useEffect, useState, useRef } from 'react';
import type { ITrip } from '../../interface/ITripdetails';
import { Navbar } from "../../components/home/Navbar";
import { MainFooter } from "../../components/MainFooter";
import toast from 'react-hot-toast';

const ProfilePage = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();

    const [kycStatus, setKycStatus] = useState<string>('loading');
    const [requests, setRequests] = useState<ConnectionRequest[]>([]);
    const [trips, setTrips] = useState<ITrip[]>([]);
    const [tripsLoading, setTripsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: user?.name || '', bio: user?.bio || '' });
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [expandedTripId, setExpandedTripId] = useState<string | null>(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [errors, setErrors] = useState<{
        name?: string;
        bio?: string;
        oldPassword?: string;
        newPassword?: string;
        confirmPassword?: string;
    }>({});

    const clearError = (field: string) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete (newErrors as any)[field];
            return newErrors;
        });
    };

    useEffect(() => {
        const loadData = async () => {
            if (!user?.id) return;
            try {
                const [kycRes, reqData, tripData] = await Promise.all([
                    api.get(`/api/kyc-status/${user.id}`),
                    connectionService.getPendingRequests(),
                    tripService.getUserTrips(user.id)
                ]);
                setKycStatus(kycRes.data.data?.status || 'none');
                setRequests(reqData);
                setTrips(tripData);
            } catch (err) {
                console.error("Data load failed", err);
            } finally {
                setTripsLoading(false);
            }
        };
        loadData();
    }, [user?.id]);

    if (!user) { navigate('/login'); return null; }

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    const handleSave = async () => {
        if (!user?.id) return;
        
        // Validation
        const newErrors: any = {};
        if (!editData.name.trim()) newErrors.name = "Name is required";
        if (editData.bio.length > 200) newErrors.bio = "Bio cannot exceed 200 characters";
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setIsSaving(true);
            await authService.updateProfile(user.id, editData);
            toast.success("Profile updated successfully")
            setIsEditing(false);
            setErrors({});
        } catch (error: any) {
            console.error("Profile update error", error);
            const message = error.response?.data?.message || "Failed to update profile";
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user?.id) return;
        const formData = new FormData();
        formData.append('avatar', file);
        try {
            setIsUploading(true);
            const res = await api.post('/api/profile-photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await authService.updateProfile(user.id, { avatarURL: res.data.data.imageUrl });
        } catch (error) { alert("Upload failed"); }
        finally { setIsUploading(false); }
    };

    const handleAcceptRequest = async (requestId: string) => {
        try {
            await connectionService.acceptRequest(requestId);
            const [reqData, tripData] = await Promise.all([
                connectionService.getPendingRequests(),
                tripService.getUserTrips(user.id!)
            ]);
            setRequests(reqData);
            setTrips(tripData);
        } catch (error) {
            alert("Failed to accept request");
        }
    };

    const handleRejectRequest = async (requestId: string) => {
        try {
            await connectionService.rejectRequest(requestId);
            const reqData = await connectionService.getPendingRequests();
            setRequests(reqData);
        } catch (error) {
            alert("Failed to reject request");
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: any = {};

        if (!passwordData.oldPassword) newErrors.oldPassword = "Current password is required";
        if (passwordData.newPassword.length < 6) newErrors.newPassword = "Password must be at least 6 characters";
        if (passwordData.newPassword !== passwordData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setIsChangingPassword(true);
            await authService.changePassword(user.id!, {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            toast.success("Password changed successfully");
            setIsPasswordModalOpen(false);
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setErrors({});
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            const message = error.response?.data?.message || "Failed to change password";
            
            if (message.toLowerCase().includes("current password")) {
                setErrors({ ...errors, oldPassword: message });
            } else {
                toast.error(message);
            }
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />

            <main className="grow py-12 px-4">
                <div className="max-w-7xl mx-auto">

                    <button
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-2 px-4 py-2 bg-white text-slate-500 hover:text-indigo-600 rounded-full font-bold text-sm shadow-sm border border-slate-100 transition-all hover:-translate-x-1 mb-6"
                    >
                        <ArrowLeft size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        Back to Home
                    </button>

                    {/* 1. Identity Section */}
                    <section className="relative py-12 bg-[#f0f9ff] mb-10 rounded-[2rem_0_2rem_0] overflow-hidden border border-blue-100 shadow-sm">
                        <div className="absolute -top-12 -left-12 w-40 h-40 bg-white/40 rounded-full"></div>
                        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-indigo-200/20 rounded-full"></div>

                        <div className="relative z-10 px-8 flex flex-col md:flex-row items-center md:items-start gap-8">
                            <div className="relative shrink-0">
                                <input type="file" className="hidden" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" />
                                <div className="w-40 h-40 rounded-[2rem_0_2rem_0] bg-white p-2 shadow-xl border border-blue-50 relative group">
                                    <div className="w-full h-full rounded-[1.8rem_0_1.8rem_0] bg-slate-100 flex items-center justify-center overflow-hidden">
                                        {isUploading ? (
                                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                        ) : user.avatarURL ? (
                                            <img src={user.avatarURL} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-20 h-20 text-slate-300" />
                                        )}
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute inset-0 bg-slate-800/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                        >
                                            <Camera size={24} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left pt-4">
                                {isEditing ? (
                                    <div className="space-y-4 w-full max-w-md">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={editData.name}
                                                onChange={(e) => {
                                                    setEditData({ ...editData, name: e.target.value });
                                                    if (errors.name) clearError('name');
                                                }}
                                                className={`w-full px-4 py-2.5 bg-white border ${errors.name ? 'border-red-300 ring-4 ring-red-50' : 'border-blue-100'} rounded-xl text-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm`}
                                                placeholder="Your name"
                                            />
                                            {errors.name && <p className="text-[10px] text-red-500 font-bold mt-1 pl-1 flex items-center gap-1 animate-in slide-in-from-left-2"><X size={10} /> {errors.name}</p>}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Bio</label>
                                                <span className={`text-[10px] font-bold ${editData.bio.length > 180 ? 'text-amber-500' : 'text-slate-300'}`}>{editData.bio.length}/200</span>
                                            </div>
                                            <textarea
                                                value={editData.bio}
                                                onChange={(e) => {
                                                    setEditData({ ...editData, bio: e.target.value });
                                                    if (errors.bio) clearError('bio');
                                                }}
                                                className={`w-full px-4 py-2.5 bg-white border ${errors.bio ? 'border-red-300 ring-4 ring-red-50' : 'border-blue-100'} rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-22.5 resize-none shadow-sm`}
                                                placeholder="Tell travelers about yourself..."
                                            />
                                            {errors.bio && <p className="text-[10px] text-red-500 font-bold mt-1 pl-1 flex items-center gap-1 animate-in slide-in-from-left-2"><X size={10} /> {errors.bio}</p>}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
                                            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{user.name}</h2>
                                            <span className="px-3 py-1 bg-white text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm border border-blue-50">
                                                {user.role}
                                            </span>
                                        </div>
                                        <div className="space-y-4 max-w-2xl">
                                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-500 text-sm font-medium">
                                                <span className="flex items-center gap-2"><Mail size={16} /> {user.email}</span>
                                                <span className="flex items-center gap-2"><Compass size={16} /> {user.role === 'guide' ? 'Pro Guide' : 'Verified Explorer'}</span>
                                            </div>
                                            <p className="text-gray-600 text-lg leading-relaxed italic">
                                                {user.bio ? `"${user.bio}"` : "Add a biography to share your travel spirit with the Trip Buddy community."}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 shrink-0">
                                {isEditing ? (
                                    <>
                                        <button onClick={handleSave} disabled={isSaving} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
                                            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <span>Update Profile</span>}
                                        </button>
                                        <button onClick={() => { setIsEditing(false); setEditData({ name: user.name, bio: user.bio || '' }); setErrors({}); }} className="px-8 py-3 bg-white text-slate-400 rounded-xl font-bold hover:bg-slate-50 transition-all border border-slate-100">
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => { setIsEditing(true); setErrors({}); }} className="px-6 py-3 bg-white text-slate-800 rounded-xl font-bold shadow-md hover:bg-slate-50 transition-all flex items-center gap-2 border border-slate-100">
                                            <Edit3 size={18} /> Edit Profile
                                        </button>
                                        <button onClick={handleLogout} className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all flex items-center gap-2 shadow-lg shadow-slate-200">
                                            <LogOut size={18} /> Logout
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Status Card */}
                        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Shield size={20} className="text-indigo-500" /> Account Security
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-50">
                                    <span className="text-sm font-medium text-slate-600">KYC Status</span>
                                    <span className={`text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-widest ${kycStatus === 'approved' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {kycStatus}
                                    </span>
                                </div>
                                {requests.length > 0 && (
                                    <button onClick={() => navigate('/connection-requests')} className="w-full flex items-center justify-between p-4 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-xs ring-1 ring-indigo-100">
                                        <div className="flex items-center gap-2"><UserCheck size={14} /> {requests.length} Pending Connections</div>
                                        <span className="bg-white px-2 py-0.5 rounded shadow-sm">View</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setIsPasswordModalOpen(true);
                                        setErrors({});
                                        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                                    }}
                                    className="w-full flex items-center justify-between p-4 bg-white text-slate-700 rounded-xl font-bold text-xs ring-1 ring-slate-100 hover:bg-slate-50 transition-all border border-slate-50"
                                >
                                    <div className="flex items-center gap-2">
                                        <Lock size={14} className="text-slate-400" /> Change Password
                                    </div>
                                    <span className="text-slate-300">→</span>
                                </button>
                            </div>
                        </div>

                        {/* Gallery Card */}
                        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <ImageIcon size={20} className="text-indigo-500" /> Memory Gallery
                            </h3>
                            <div className="space-y-4">
                                <p className="text-sm text-slate-500 font-medium">Showcase your personal travel memories. Only you and your connected travelers can see this.</p>
                                <button onClick={() => navigate('/gallery')} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2">
                                    <ImageIcon size={16} /> Open Gallery
                                </button>
                            </div>
                        </div>

                        {/* Itinerary Card */}
                        <div className="lg:col-span-1 bg-white p-8 rounded-xl shadow-lg border border-slate-100">
                            <div className="mt-2 text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                                    <ShieldQuestion size={24} className="text-indigo-500" />
                                </div>
                                <h3 className="font-bold text-slate-800 mb-2">Coming soon...</h3>
                                <p className="text-xs text-slate-400 mb-6">Ai assistent for all your trip</p>
                                <button onClick={() => navigate("/tripDeatail")} className="w-full py-3 bg-white text-indigo-600 border border-indigo-100 rounded-xl font-bold text-xs hover:bg-indigo-50 transition-all shadow-sm">Not ready yet</button>
                            </div>
                        </div>

                        <div className="lg:col-span-3 bg-white p-8 rounded-xl shadow-lg border border-slate-100">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Plane size={20} className="text-indigo-500" /> My Trips
                                </h3>
                                <button onClick={() => navigate('/create-trip')} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors">+ New Trip</button>
                            </div>

                            {tripsLoading ? (
                                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-500" /></div>
                            ) : trips.length > 0 ? (
                                <div className="space-y-4">
                                    {trips.map((trip) => {
                                        const tripRequests = requests.filter(req => req.tripId?._id === trip._id);
                                        const isExpanded = expandedTripId === trip._id;
                                        return (
                                            <div key={trip._id} className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden transition-all hover:border-indigo-200">
                                                <div onClick={() => setExpandedTripId(isExpanded ? null : trip._id)} className="flex items-center justify-between p-5 cursor-pointer group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <MapPin size={22} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="font-bold text-slate-800 text-sm truncate pr-8">{trip.title}</h4>
                                                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest truncate">{trip.destination}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="hidden sm:flex flex-col items-end gap-2 text-right">
                                                            <span className={`text-[9px] font-black uppercase tracking-tight px-1.5 py-0.5 rounded ${trip.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                                                {trip.status}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                {tripRequests.length > 0 && (
                                                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full text-[9px] font-black animate-pulse">
                                                                        <UserCheck size={10} /> {tripRequests.length} NEW
                                                                    </span>
                                                                )}
                                                                <p className="text-[10px] text-slate-400 font-bold">{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={(e) => { e.stopPropagation(); navigate(`/edit-trip/${trip._id}`); }} className="p-2 bg-white text-slate-400 hover:text-indigo-600 rounded-lg shadow-sm border border-slate-100 transition-colors" title="Edit Trip">
                                                                <Edit3 size={14} />
                                                            </button>
                                                            {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                                                        </div>
                                                    </div>
                                                </div>
                                                {isExpanded && (
                                                    <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-white/50 animate-in slide-in-from-top-2 duration-300">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                                            <div>
                                                                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                                                    <Users size={12} /> Trip Members ({trip.members?.length || 0})
                                                                </h5>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {trip.members && trip.members.length > 0 ? (
                                                                        trip.members.map(member => (
                                                                            <div key={member._id} className="flex items-center gap-2 bg-white p-1.5 rounded-full border border-slate-100 shadow-sm pr-3">
                                                                                <img src={member.avatarURL || `https://ui-avatars.com/api/?name=${member.name}`} alt="" className="w-6 h-6 rounded-full object-cover" />
                                                                                <span className="text-xs font-bold text-slate-700">{member.name}</span>
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <p className="text-xs text-slate-400 italic">No members yet</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col gap-3 justify-center">
                                                                <button onClick={() => navigate('/expenses', { state: { tripId: trip._id, from: '/profile' } })} className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all">
                                                                    <Receipt size={14} /> Expense Split
                                                                </button>
                                                                <button onClick={() => navigate(`/trip-details/${trip._id}`, { state: { from: '/profile' } })} className="flex items-center justify-center gap-2 w-full py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all">
                                                                    <Globe size={14} /> Full Trip Details
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {tripRequests.length > 0 && (
                                                            <div className="mt-6 pt-6 border-t border-slate-100">
                                                                <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-3 flex items-center gap-2">
                                                                    <UserCheck size={12} /> Pending Requests for this Trip ({tripRequests.length})
                                                                </h5>
                                                                <div className="space-y-2">
                                                                    {tripRequests.map(req => (
                                                                        <div key={req._id} className="flex items-center justify-between bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                                                                            <div className="flex items-center gap-3">
                                                                                <img src={req.senderId.avatarURL || `https://ui-avatars.com/api/?name=${req.senderId.name}`} alt="" className="w-8 h-8 rounded-full object-cover border border-white" />
                                                                                <div>
                                                                                    <p className="text-xs font-bold text-slate-800">{req.senderId.name}</p>
                                                                                    <p className="text-[10px] text-slate-500">{req.senderId.email}</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <button onClick={() => handleAcceptRequest(req._id)} className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-100">
                                                                                    <Check size={14} />
                                                                                </button>
                                                                                <button onClick={() => handleRejectRequest(req._id)} className="p-1.5 bg-white text-slate-400 border border-slate-200 rounded-lg hover:bg-rose-50 hover:text-rose-500 transition-colors shadow-sm">
                                                                                    <X size={14} />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                                    <Globe className="w-12 h-12 text-slate-200 mb-4" />
                                    {/* <h3 className="text-slate-500 font-bold mb-1">Your passport is waiting for stamps.</h3> */}
                                    <p className="text-slate-400 text-sm mb-6">Start planning your dream journey today.</p>
                                    <button onClick={() => navigate('/create-trip')} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100">Launch First Trip</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <MainFooter />

            {/* Password Change Modal */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !isChangingPassword && setIsPasswordModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <Shield size={20} className="text-indigo-500" /> Change Your Password
                            </h3>
                            <p className="text-xs text-slate-400 font-medium mb-6 uppercase tracking-widest">Provide your current and new password below</p>

                             <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Current Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.oldPassword}
                                        onChange={(e) => {
                                            setPasswordData({ ...passwordData, oldPassword: e.target.value });
                                            if (errors.oldPassword) clearError('oldPassword');
                                        }}
                                        className={`w-full px-4 py-3 bg-slate-50 border ${errors.oldPassword ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-100'} rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm`}
                                        placeholder="••••••••"
                                    />
                                    {errors.oldPassword && <p className="text-[10px] text-red-500 font-bold mt-1 pl-1 animate-in slide-in-from-left-2">{errors.oldPassword}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={passwordData.newPassword}
                                        onChange={(e) => {
                                            setPasswordData({ ...passwordData, newPassword: e.target.value });
                                            if (errors.newPassword) clearError('newPassword');
                                        }}
                                        className={`w-full px-4 py-3 bg-slate-50 border ${errors.newPassword ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-100'} rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm`}
                                        placeholder="Min. 6 characters"
                                    />
                                    {errors.newPassword && <p className="text-[10px] text-red-500 font-bold mt-1 pl-1 animate-in slide-in-from-left-2">{errors.newPassword}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => {
                                            setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                                            if (errors.confirmPassword) clearError('confirmPassword');
                                        }}
                                        className={`w-full px-4 py-3 bg-slate-50 border ${errors.confirmPassword ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-100'} rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm`}
                                        placeholder="••••••••"
                                    />
                                    {errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold mt-1 pl-1 animate-in slide-in-from-left-2">{errors.confirmPassword}</p>}
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        disabled={isChangingPassword}
                                        onClick={() => setIsPasswordModalOpen(false)}
                                        className="flex-1 py-3 px-4 bg-slate-50 text-slate-400 rounded-xl font-bold hover:bg-slate-100 transition-all disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isChangingPassword}
                                        className="flex-[2] py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                    >
                                        {isChangingPassword ? <Loader2 className="animate-spin" size={18} /> : <span>Change Password</span>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
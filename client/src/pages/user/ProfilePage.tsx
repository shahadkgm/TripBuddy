import { useNavigate } from 'react-router-dom';
import {
    User, Mail, MapPin, Camera,
    Shield, LogOut,
    ArrowLeft, Home, UserCheck, Plane,
    Loader2, Edit3, Globe, Compass
} from 'lucide-react';
import { authService } from '../../services/c.authService';
import { connectionService } from '../../services/connection.service';
import { tripService } from '../../services/trip.service';
import api from '../../utils/api';
import { useEffect, useState, useRef } from 'react';
import type { ITrip } from '../../interface/ITripdetails';
import { Navbar } from "../../components/home/Navbar";
import { MainFooter } from "../../components/MainFooter";

const ProfilePage = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();

    const [kycStatus, setKycStatus] = useState<string>('loading');
    const [requests, setRequests] = useState<any[]>([]);
    const [trips, setTrips] = useState<ITrip[]>([]);
    const [tripsLoading, setTripsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: user?.name || '', bio: user?.bio || '' });
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        try {
            setIsSaving(true);
            await authService.updateProfile(user.id, editData);
            setIsEditing(false);
        } catch (error) {
            alert("Failed to update profile.");
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

                    {/* 1. Identity Section (The Blob Style) */}
                    <section className="relative py-12 bg-[#f0f9ff] mb-10 rounded-[2rem_0_2rem_0] overflow-hidden border border-blue-100 shadow-sm">
                        {/* Decorative Circles from Home Page */}
                        <div className="absolute -top-12 -left-12 w-40 h-40 bg-white/40 rounded-full"></div>
                        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-indigo-200/20 rounded-full"></div>

                        <div className="relative z-10 px-8 flex flex-col md:flex-row items-center md:items-start gap-8">
                            {/* Avatar Component */}
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

                            {/* Info & Editing */}
                            <div className="flex-1 text-center md:text-left pt-4">
                                {isEditing ? (
                                    <div className="space-y-4 w-full max-w-md">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={editData.name}
                                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white border border-blue-100 rounded-xl text-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                                                placeholder="Your name"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Bio</label>
                                            <textarea
                                                value={editData.bio}
                                                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white border border-blue-100 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[90px] resize-none shadow-sm"
                                                placeholder="Tell travelers about yourself..."
                                            />
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
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                        >
                                            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <span>Update Profile</span>}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                setEditData({ name: user.name, bio: user.bio || '' });
                                            }}
                                            className="px-8 py-3 bg-white text-slate-400 rounded-xl font-bold hover:bg-slate-50 transition-all border border-slate-100"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => setIsEditing(true)} className="px-6 py-3 bg-white text-slate-800 rounded-xl font-bold shadow-md hover:bg-slate-50 transition-all flex items-center gap-2 border border-slate-100">
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

                    {/* 2. Content Grid (FeatureGrid Style) */}
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
                            </div>
                        </div>

                        {/* Itinerary Card */}
                        <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-lg border border-slate-100">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Plane size={20} className="text-indigo-500" /> Planned Itineraries
                                </h3>
                                <button onClick={() => navigate('/create-trip')} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors">+ New Trip</button>
                            </div>

                            {tripsLoading ? (
                                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-500" /></div>
                            ) : trips.length > 0 ? (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {trips.map((trip) => (
                                        <div key={trip._id} onClick={() => navigate(`/trip/${trip._id}`)} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-md transition-all cursor-pointer group relative">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <MapPin size={22} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-slate-800 text-sm truncate pr-8">{trip.title}</h4>
                                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest truncate">{trip.destination}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`text-[9px] font-black uppercase tracking-tight px-1.5 py-0.5 rounded ${trip.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                                    {trip.status}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/edit-trip/${trip._id}`);
                                                    }}
                                                    className="p-2 bg-white text-slate-400 hover:text-indigo-600 rounded-lg shadow-sm border border-slate-100 transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Edit Trip"
                                                >
                                                    <Edit3 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                                    <Globe className="w-12 h-12 text-slate-200 mb-4" />
                                    <h3 className="text-slate-500 font-bold mb-1">Your passport is waiting for stamps.</h3>
                                    <p className="text-slate-400 text-sm mb-6">Start planning your dream journey today.</p>
                                    <button onClick={() => navigate('/create-trip')} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100">Launch First Trip</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <MainFooter />
        </div>
    );
};

export default ProfilePage;
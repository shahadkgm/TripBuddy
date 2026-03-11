import { useNavigate } from 'react-router-dom';
import {
    User, Mail, Camera,
    Shield, LogOut,
    ArrowLeft, Plane,
    Loader2, Globe, Image as ImageIcon,
    X, Compass, Edit3, Lock, Bot, UserCheck, MessageCircle
} from 'lucide-react';
import { authService } from '../../services/c.authService';
import { connectionService } from '../../services/c.connection.service';
import api from '../../utils/api';
import { useEffect, useState, useRef } from 'react';
import { Navbar } from "../../components/home/Navbar";
import { MainFooter } from "../../components/MainFooter";
import { PlannedTrips } from "../../components/profile/PlannedTrips";
import { RequestedTrips } from "../../components/profile/RequestedTrips";
import { LiveChats } from "../../components/profile/LiveChats";
import toast from 'react-hot-toast';

const ProfilePage = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();

    const [kycStatus, setKycStatus] = useState<string>('loading');
    const [requests, setRequests] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'planned' | 'requested' | 'chats'>('planned');
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: user?.name || '', bio: user?.bio || '' });
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
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
        const loadInitialData = async () => {
            if (!user?.id) return;
            try {
                const [kycRes, reqData] = await Promise.all([
                    api.get(`/api/kyc-status/${user.id}`),
                    connectionService.getPendingRequests()
                ]);
                setKycStatus(kycRes.data.data?.status || 'none');
                setRequests(reqData);
            } catch (err) {
                console.error("Data load failed", err);
            }
        };
        loadInitialData();
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
                    <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-10">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                            <div className="relative shrink-0">
                                <input type="file" className="hidden" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" />
                                <div className="w-40 h-40 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg relative group">
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
                                                className={`w-full px-4 py-2 bg-slate-50 border ${errors.name ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-100'} rounded-xl text-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all`}
                                                placeholder="Your name"
                                            />
                                            {errors.name && <p className="text-[10px] text-red-500 font-bold mt-1 pl-1 flex items-center gap-1"><X size={10} /> {errors.name}</p>}
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
                                                className={`w-full px-4 py-2 bg-slate-50 border ${errors.bio ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-100'} rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[100px] resize-none`}
                                                placeholder="Tell travelers about yourself..."
                                            />
                                            {errors.bio && <p className="text-[10px] text-red-500 font-bold mt-1 pl-1 flex items-center gap-1"><X size={10} /> {errors.bio}</p>}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-col md:flex-row items-center gap-3 mb-2 text-center md:text-left">
                                            <h2 className="text-3xl font-bold text-slate-800">{user.name}</h2>
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                                {user.role}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 font-medium mb-4 flex items-center justify-center md:justify-start gap-2">
                                            <Mail size={16} /> {user.email}
                                        </p>
                                        <p className="text-slate-600 text-sm leading-relaxed max-w-xl">
                                            {user.bio || "No biography added yet."}
                                        </p>
                                    </>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 shrink-0">
                                {isEditing ? (
                                    <>
                                        <button onClick={handleSave} disabled={isSaving} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
                                            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <span>Save Changes</span>}
                                        </button>
                                        <button onClick={() => { setIsEditing(false); setEditData({ name: user.name, bio: user.bio || '' }); setErrors({}); }} className="px-8 py-3 bg-white text-slate-400 rounded-xl font-bold hover:bg-slate-50 transition-all border border-slate-100">
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => { setIsEditing(true); setErrors({}); }} className="px-8 py-3 bg-white text-slate-800 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 border border-slate-100">
                                            <Edit3 size={18} /> Edit Profile
                                        </button>
                                        <button onClick={handleLogout} className="px-8 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all flex items-center gap-2 shadow-lg shadow-slate-200">
                                            <LogOut size={18} /> Logout
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </section>



                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
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

                        {/* AI Assistant Card */}
                        <div className="lg:col-span-1 bg-white p-8 rounded-xl shadow-lg border border-slate-100">
                            <div className="mt-2 text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                                    <Bot size={24} className="text-indigo-500" />
                                </div>
                                <h3 className="font-bold text-slate-800 mb-2">AI Travel Assistant</h3>
                                <p className="text-xs text-slate-400 mb-6">Your personal 24/7 AI-powered travel buddy for trips and planning.</p>
                                <button onClick={() => navigate("/ai-assistant")} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2">
                                    <Bot size={14} /> Open Assistant
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 3. Main Content: Tabs for Trips */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-100 px-8">
                            <div className="flex items-center gap-8">
                                <button
                                    onClick={() => setActiveTab('planned')}
                                    className={`relative py-6 text-sm font-bold transition-all ${activeTab === 'planned' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    <span className="flex items-center gap-2 italic">
                                        <Plane size={18} /> Planned Itineraries
                                    </span>
                                    {activeTab === 'planned' && (
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full"></div>
                                    )}
                                </button>
                                <div className="h-6 w-[1.5px] bg-slate-200"></div>
                                <button
                                    onClick={() => setActiveTab('requested')}
                                    className={`relative py-6 text-sm font-bold transition-all ${activeTab === 'requested' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    <span className="flex items-center gap-2 italic">
                                        Requested Trips
                                    </span>
                                    {activeTab === 'requested' && (
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full"></div>
                                    )}
                                </button>
                                <div className="h-6 w-[1.5px] bg-slate-200"></div>
                                <button
                                    onClick={() => setActiveTab('chats')}
                                    className={`relative py-6 text-sm font-bold transition-all ${activeTab === 'chats' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    <span className="flex items-center gap-2 italic">
                                        <MessageCircle size={18} /> Live Chats
                                    </span>
                                    {activeTab === 'chats' && (
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full"></div>
                                    )}
                                </button>
                            </div>

                            {activeTab === 'planned' && (
                                <button
                                    onClick={() => navigate('/create-trip')}
                                    className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-all flex items-center gap-2"
                                >
                                    + New Trip
                                </button>
                            )}
                        </div>

                        <div className="p-8">
                            {activeTab === 'planned' ? (
                                <PlannedTrips userId={user.id!} />
                            ) : activeTab === 'requested' ? (
                                <RequestedTrips userId={user.id!} />
                            ) : (
                                <LiveChats userId={user.id!} />
                            )}
                        </div>
                    </div>
                </div>
            </main >

            <MainFooter />

            {/* Password Change Modal */}
            {
                isPasswordModalOpen && (
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
                )
            }
        </div >
    );
};

export default ProfilePage;
import React, { useState, useRef } from "react";
import { 
    User, Camera, MapPin, Briefcase, 
    Star, ArrowLeft, Loader2, Save 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/c.authService";
import { guideService } from "../../services/c.guide.service";
import toast from "react-hot-toast";
import { GuideLayout } from "../../components/guide/GuideLayout";

export const GuideProfilePage = () => {
    const user = authService.getCurrentUser();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        bio: user?.guideProfile?.bio || "",
        serviceArea: user?.guideProfile?.serviceArea || "",
        hourlyRate: user?.guideProfile?.hourlyRate || 0,
        yearsOfExperience: user?.guideProfile?.yearsOfExperience || 0,
        specialties: user?.guideProfile?.specialties || []
    });

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const data = new FormData();
        data.append('avatar', file);

        try {
            setIsUploading(true);
            const updatedProfile = await guideService.updateProfile(data);
            
            // Update local storage/context
            if (user) {
                const updatedUser = { 
                    ...user, 
                    avatarURL: updatedProfile.avatarURL,
                    guideProfile: { ...user.guideProfile, avatarURL: updatedProfile.avatarURL } 
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
            
            toast.success("Profile photo updated!");
            window.location.reload(); // Refresh to sync photo everywhere
        } catch (error) {
            toast.error("Failed to upload photo");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            const updatedProfile = await guideService.updateProfile(formData);
            
            if (user) {
                const updatedUser = { 
                    ...user, 
                    guideProfile: { ...user.guideProfile, ...updatedProfile } 
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }

            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <GuideLayout>
            <div className="p-6 lg:p-10 max-w-5xl mx-auto">
                <header className="mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Your Profile</h1>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Manage your professional identity</p>
                    </div>

                    <button 
                        onClick={() => navigate('/guide-dashboard')}
                        className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-indigo-600 font-black uppercase tracking-widest text-[10px] transition-colors"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                </header>

                <form onSubmit={handleSave} className="space-y-8">
                    {/* Hero Section */}
                    <div className="bg-slate-900 rounded-[2.5rem] lg:rounded-[3rem] p-8 lg:p-12 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 lg:gap-12 text-center md:text-left">
                            <div className="relative group">
                                <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-[2.5rem] bg-indigo-500 overflow-hidden ring-4 ring-white/10 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                                    <img 
                                        src={user?.avatarURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} 
                                        alt={user?.name} 
                                        className="w-full h-full object-cover"
                                    />
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                                            <Loader2 size={32} className="text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute -bottom-2 -right-2 p-3 bg-white text-slate-900 rounded-2xl shadow-xl hover:bg-indigo-500 hover:text-white transition-all duration-300 transform group-hover:translate-y-[-4px]"
                                >
                                    <Camera size={18} />
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                />
                            </div>

                            <div className="flex-1">
                                <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-none mb-2 lowercase">{user?.name}</h2>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-widest">
                                        <Star size={14} fill="currentColor" /> Expert Guide
                                    </span>
                                    <span className="text-white/20 hidden md:inline">•</span>
                                    <span className="text-xs font-bold text-white/60 lowercase italic opacity-80">{user?.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Info */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] lg:rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">About Your Services</label>
                                    <textarea 
                                        className="w-full bg-slate-50 border-none rounded-2xl p-6 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-indigo-100 min-h-[160px] resize-none transition-all"
                                        placeholder="Describe your expertise, local knowledge, and what makes your tours special..."
                                        value={formData.bio}
                                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Service Area</label>
                                        <div className="relative group">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                            <input 
                                                type="text" 
                                                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-black text-slate-900 focus:ring-2 focus:ring-indigo-100 transition-all uppercase tracking-tight"
                                                placeholder="e.g. Ladakh, Himachal"
                                                value={formData.serviceArea}
                                                onChange={(e) => setFormData({...formData, serviceArea: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Hourly Rate (₹)</label>
                                        <div className="relative group">
                                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                            <input 
                                                type="number" 
                                                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-black text-slate-900 focus:ring-2 focus:ring-indigo-100 transition-all tracking-tight"
                                                placeholder="e.g. 500"
                                                value={formData.hourlyRate}
                                                onChange={(e) => setFormData({...formData, hourlyRate: parseInt(e.target.value)})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-8">
                            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience & Specialities</h4>
                                
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Experience</p>
                                    <div className="flex items-end gap-2">
                                        <input 
                                            type="number" 
                                            className="w-20 border-none bg-transparent p-0 text-3xl font-black text-slate-900 focus:ring-0 leading-none"
                                            value={formData.yearsOfExperience}
                                            onChange={(e) => setFormData({...formData, yearsOfExperience: parseInt(e.target.value)})}
                                        />
                                        <span className="text-xs font-black text-indigo-500 uppercase pb-1">Years</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {['Hiking', 'Photography', 'Culture', 'History', 'Food', 'Wildlife'].map((specialty) => (
                                        <button
                                            type="button"
                                            key={specialty}
                                            onClick={() => {
                                                const current = formData.specialties;
                                                const next = current.includes(specialty)
                                                    ? current.filter(s => s !== specialty)
                                                    : [...current, specialty];
                                                setFormData({...formData, specialties: next});
                                            }}
                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                                formData.specialties.includes(specialty)
                                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                                : "bg-white text-slate-400 hover:text-slate-900 border border-slate-100 hover:border-indigo-100"
                                            }`}
                                        >
                                            {specialty}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sticky bottom-8 z-20 flex justify-center">
                        <button 
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center justify-center gap-3 px-12 py-5 bg-slate-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {isSaving ? "Publishing Changes..." : "Commit Update"}
                        </button>
                    </div>
                </form>
            </div>
        </GuideLayout>
    );
};

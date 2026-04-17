import React, { useState, useRef } from "react";
import { 
    User, Camera, MapPin, Briefcase, 
    Star, ArrowLeft, Loader2, Save 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/c.authService";
import { guideService } from "../../services/c.guide.service";
import { GuideSidebar } from "./GuideSidebar";
import toast from "react-hot-toast";

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
        <div className="flex bg-slate-50 min-h-screen font-outfit">
            <GuideSidebar />

            <div className="flex-1 ml-64 p-10">
                <header className="mb-10 flex items-center justify-between">
                    <div>
                        <button 
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors mb-4 group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Back to Dashboard</span>
                        </button>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Edit Your Profile</h1>
                    </div>
                </header>

                <div className="max-w-4xl bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                    <form onSubmit={handleSave}>
                        {/* Header/Cover Placeholder */}
                        <div className="h-40 bg-gradient-to-r from-indigo-600 to-indigo-400 relative">
                            <div className="absolute -bottom-16 left-12">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-[2rem] bg-white p-1.5 shadow-xl">
                                        <div className="w-full h-full rounded-[1.75rem] bg-slate-100 overflow-hidden relative border border-slate-50">
                                            {isUploading ? (
                                                <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                                                    <Loader2 className="animate-spin text-indigo-600" />
                                                </div>
                                            ) : (
                                                <img 
                                                    src={user?.guideProfile?.avatarURL || user?.avatarURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} 
                                                    className="w-full h-full object-cover"
                                                    alt={user?.name}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-2 right-2 p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-slate-900 transition-colors border-2 border-white"
                                    >
                                        <Camera size={16} />
                                    </button>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handlePhotoChange} 
                                        className="hidden" 
                                        accept="image/*"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-24 px-12 pb-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column: Basic Info */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Biography</label>
                                        <textarea 
                                            value={formData.bio}
                                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[150px] resize-none"
                                            placeholder="Tell travelers about your expertise..."
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Service Area (Place)</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input 
                                                type="text"
                                                value={formData.serviceArea}
                                                onChange={(e) => setFormData({...formData, serviceArea: e.target.value})}
                                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                placeholder="e.g. Munnar, Kerala"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Details */}
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Rate (₹/Day)</label>
                                            <div className="relative">
                                                <input 
                                                    type="number"
                                                    value={formData.hourlyRate}
                                                    onChange={(e) => setFormData({...formData, hourlyRate: Number(e.target.value)})}
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Exp. (Years)</label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input 
                                                    type="number"
                                                    value={formData.yearsOfExperience}
                                                    onChange={(e) => setFormData({...formData, yearsOfExperience: Number(e.target.value)})}
                                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Specialties</label>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {formData.specialties.map((s, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-lg border border-indigo-100 flex items-center gap-2">
                                                    {s}
                                                    <button 
                                                        type="button"
                                                        onClick={() => setFormData({...formData, specialties: formData.specialties.filter((_, i) => i !== idx)})}
                                                        className="hover:text-red-500"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <input 
                                            type="text"
                                            placeholder="Press Enter to add specialty"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const val = (e.target as HTMLInputElement).value.trim();
                                                    if (val && !formData.specialties.includes(val)) {
                                                        setFormData({...formData, specialties: [...formData.specialties, val]});
                                                        (e.target as HTMLInputElement).value = '';
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 flex items-center justify-end gap-4 border-t border-slate-50 pt-8">
                                <button 
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-indigo-200 hover:bg-indigo-600 transition-all flex items-center gap-3 disabled:opacity-50 active:scale-95"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    Save Profile
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// client/src/modules/auth/pages/GuideRegistrationPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../../services/c.authService';
import { Camera, MapPin, DollarSign, ArrowLeft, Loader2 } from 'lucide-react';
import { GuideStatusPage } from './GuideStatusPage';
import { Navigate } from 'react-router-dom';
import api from '../../utils/api';

// const API_URL = import.meta.env.VITE_API_URL;

const SPECIALTIES = [
  { id: 'food', label: 'Food Tours' },
  { id: 'history', label: 'History & Culture' },
  { id: 'adventure', label: 'Adventure & Hiking' },
  { id: 'nightlife', label: 'Nightlife' }
];

export const GuideRegistrationPage = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  console.log("user from guideRegistractionpage ", user)


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [appStatus, setAppStatus] = useState<'none' | 'pending' | 'verified' | 'loading'>('loading');

  const [formData, setFormData] = useState({
    bio: '',
    hourlyRate: '',
    serviceArea: '',
    specialties: [] as string[],
    avatarFile: null as File | null,
    yearsOfExperience: '',
  });

  const [errors, setErrors] = useState({
    bio: '',
    hourlyRate: '',
    serviceArea: '',
    specialties: '',
    avatarFile: '',
    yearsOfExperience: '',
  });

  useEffect(() => {
    const checkStatus = async () => {
      if (!user) {
        setAppStatus('none');
        return;
      }
      try {
        const res = await api.get(`/api/guides/status/${user.id}`);
        if (res.data.data.exists) {
          setAppStatus(res.data.data.isVerified ? 'verified' : 'pending');
        } else {
          setAppStatus('none');
        }
      } catch (err) {
        setAppStatus('none');
      }
    };
    checkStatus();
  }, [user]);

  if (appStatus === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-tb-purple animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Checking application status...</p>
      </div>
    );
  }

  if (appStatus === 'pending') return <GuideStatusPage />;
  if (appStatus === 'verified') return <Navigate to="/guide-dashboard" replace />;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, avatarFile: file });
      setPreview(URL.createObjectURL(file));
      if (errors.avatarFile) setErrors({ ...errors, avatarFile: '' });
    }
  };

  const handleSpecialtyChange = (id: string) => {
    setFormData(prev => {
      const newSpecialties = prev.specialties.includes(id)
        ? prev.specialties.filter(s => s !== id)
        : [...prev.specialties, id];

      if (errors.specialties) setErrors({ ...errors, specialties: '' });
      return { ...prev, specialties: newSpecialties };
    });
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      bio: '',
      hourlyRate: '',
      serviceArea: '',
      specialties: '',
      avatarFile: '',
      yearsOfExperience: '',
    };

    if (!formData.bio.trim()) {
      newErrors.bio = 'Summary is required';
      isValid = false;
    } else if (formData.bio.length < 50) {
      newErrors.bio = 'Summary must be at least 50 characters';
      isValid = false;
    }

    if (!formData.hourlyRate) {
      newErrors.hourlyRate = 'Hourly rate is required';
      isValid = false;
    } else if (Number(formData.hourlyRate) <= 0) {
      newErrors.hourlyRate = 'Rate must be greater than 0';
      isValid = false;
    }

    if (!formData.serviceArea.trim()) {
      newErrors.serviceArea = 'Service area is required';
      isValid = false;
    }

    if (!formData.yearsOfExperience) {
      newErrors.yearsOfExperience = 'Years of experience is required';
      isValid = false;
    } else if (Number(formData.yearsOfExperience) < 0) {
      newErrors.yearsOfExperience = 'Experience cannot be negative';
      isValid = false;
    }

    if (formData.specialties.length === 0) {
      newErrors.specialties = 'Select at least one specialty';
      isValid = false;
    }

    if (!formData.avatarFile) {
      newErrors.avatarFile = 'Profile photo is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Please login first");
    if (!validateForm()) return;

    setIsSubmitting(true);
    const t = toast.loading("Submitting application...");

    try {
      const data = new FormData();
      const token = authService.getToken();
      if (!token) {
        toast.error("Session expired. please login again", { id: t });
        setIsSubmitting(false);
        return;
      }
      data.append('userId', user.id);
      data.append('bio', formData.bio);
      data.append('hourlyRate', formData.hourlyRate);
      data.append('serviceArea', formData.serviceArea);
      data.append('specialties', JSON.stringify(formData.specialties));
      data.append('yearsOfExperience', formData.yearsOfExperience);
      if (formData.avatarFile) data.append('avatar', formData.avatarFile);

      await api.post(`/api/guides/register`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success("Application submitted!", { id: t });
      setAppStatus('pending');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed", { id: t });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-tb-purple">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </button>
          <h1 className="font-bold text-xl">Apply as Local Expert</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-10 px-4">
        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          {/* Section 1: Identity */}
          <div className={`bg-white p-8 rounded-2xl shadow-sm border ${errors.avatarFile ? 'border-red-500' : 'border-gray-100'
            }`}>
            <div className="flex items-center gap-4 mb-6">
              <span className="w-8 h-8 bg-tb-purple text-white rounded-full flex items-center justify-center font-bold">1</span>
              <h2 className="text-xl font-bold">Profile Identity</h2>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className="relative group cursor-pointer">
                <div className={`w-24 h-24 rounded-full overflow-hidden border-4 ${errors.avatarFile ? 'border-red-300' : 'border-tb-purple/20'
                  } bg-gray-100`}>
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 m-8 text-gray-400" />
                  )}
                </div>
                <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
              </div>
              <p className="mt-2 text-sm text-tb-purple font-medium">Upload Professional Photo</p>
              {errors.avatarFile && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.avatarFile}</p>
              )}
            </div>
          </div>

          {/* Section 2: Expertise */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <span className="w-8 h-8 bg-tb-purple text-white rounded-full flex items-center justify-center font-bold">2</span>
              <h2 className="text-xl font-bold">Expertise & Rate</h2>
            </div>

            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guiding Summary</label>
                <textarea
                  className={`w-full p-3 border ${errors.bio ? 'border-red-500' : 'border-gray-200'
                    } rounded-xl focus:ring-2 focus:ring-tb-purple outline-none transition-all`}
                  rows={3}
                  placeholder="Tell travelers about your local secrets..."
                  value={formData.bio}
                  onChange={e => {
                    setFormData({ ...formData, bio: e.target.value });
                    if (errors.bio) setErrors({ ...errors, bio: '' });
                  }}
                />
                {errors.bio && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.bio}</p>
                )}
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input type="number" className={`w-full pl-10 pr-4 py-3 border ${errors.hourlyRate ? 'border-red-500' : 'border-gray-200'
                      } rounded-xl`} placeholder="45"
                      value={formData.hourlyRate}
                      onChange={e => {
                        setFormData({ ...formData, hourlyRate: e.target.value });
                        if (errors.hourlyRate) setErrors({ ...errors, hourlyRate: '' });
                      }}
                    />
                  </div>
                  {errors.hourlyRate && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{errors.hourlyRate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Area</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input type="text" className={`w-full pl-10 pr-4 py-3 border ${errors.serviceArea ? 'border-red-500' : 'border-gray-200'
                      } rounded-xl`} placeholder="e.g. South Goa"
                      value={formData.serviceArea}
                      onChange={e => {
                        setFormData({ ...formData, serviceArea: e.target.value });
                        if (errors.serviceArea) setErrors({ ...errors, serviceArea: '' });
                      }}
                    />
                  </div>
                  {errors.serviceArea && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{errors.serviceArea}</p>
                  )}
                </div>
                {/* Years of Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      className={`w-full px-4 py-3 border ${errors.yearsOfExperience ? 'border-red-500' : 'border-gray-200'
                        } rounded-xl focus:ring-2 focus:ring-tb-purple outline-none`}
                      placeholder="e.g. 5"
                      value={formData.yearsOfExperience}
                      onChange={e => {
                        setFormData({ ...formData, yearsOfExperience: e.target.value });
                        if (errors.yearsOfExperience) setErrors({ ...errors, yearsOfExperience: '' });
                      }}
                    />
                  </div>
                  {errors.yearsOfExperience && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{errors.yearsOfExperience}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Specialities */}
          <div className={`bg-white p-8 rounded-2xl shadow-sm border ${errors.specialties ? 'border-red-500' : 'border-gray-100'
            }`}>
            <div className="flex items-center gap-4 mb-6">
              <span className="w-8 h-8 bg-tb-purple text-white rounded-full flex items-center justify-center font-bold">3</span>
              <h2 className="text-xl font-bold">Tour Specialities</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {SPECIALTIES.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSpecialtyChange(s.id)}
                  className={`px-4 py-2 rounded-full border transition-all ${formData.specialties.includes(s.id)
                    ? 'bg-tb-purple text-white border-tb-purple'
                    : 'bg-white text-gray-600 border-gray-200'
                    }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {errors.specialties && (
              <p className="mt-3 text-xs text-red-500 font-medium text-center">{errors.specialties}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#10b981] text-white text-lg font-bold rounded-xl shadow-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Processing..." : "🚀 Submit Application"}
          </button>
        </form>
      </main>
    </div>
  );
};
  
  //frontend/src/modules/auth/pages/CreateTripPage.tsx
  import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Calendar, Users, DollarSign, 
  Briefcase, Hotel, Plane,CheckCircle, FileText, Image as ImageIcon, X 
} from 'lucide-react';
import axios from 'axios';
import { authService } from '../../../modules/auth/services/auth.service';

const API_URL = import.meta.env.VITE_API_URL;

const INTERESTS = [
  "Beaches", "Adventure Sports", "Shopping", "City Tours",
  "History/Culture", "Nightlife", "Nature/Parks", "Food & Dining"
];

const CreateTripPage = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    travelers: 1,
    startDate: '',
    endDate: '',
    accommodation: 'hotel',
    budget: '',
    transport: 'flight',
    notes: '',
    interests: [] as string[],
  });
  // const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
const [showSuccess, setShowSuccess] = useState(false); 
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInterestChange = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files[0]) {
  //     setImage(e.target.files[0]);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = user?.user?.id;
    if (!userId) {
      alert("You must be logged in to create a trip.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('userId', userId);
      data.append('title', formData.title);
      data.append('destination', formData.destination);
      data.append('startDate', formData.startDate);
      data.append('endDate', formData.endDate);
      data.append('budget', formData.budget);
      data.append('description', formData.notes);
      data.append('preferences', JSON.stringify({
        travelers: formData.travelers,
        accommodation: formData.accommodation,
        transport: formData.transport,
        interests: formData.interests
      }));
      
      // if (image) {
      //   data.append('tripImage', image);
      // }

      // Replace with your actual API endpoint for creating a trip
      const response = await axios.post(`${API_URL}/api/plantrips`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.status === 201) {
        setShowSuccess(true)
        setTimeout(()=>{

          navigate('/dashboard'); 
        },2000)
      }
    } catch (error) {
      console.error("Failed to create trip:", error);
      alert("Failed to create trip. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm mx-4 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip Created!</h2>
            <p className="text-gray-500">Your adventure to {formData.destination} has been saved successfully.</p>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto bg-white rounded-4xl shadow-xl overflow-hidden relative">
        {/* Close Button */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="py-10 px-8 md:px-12">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-extrabold text-indigo-700 mb-3">Plan Your New Adventure</h1>
            <p className="text-gray-500 text-base max-w-xl mx-auto">
              Fill out the details to create your personalized Trip Buddy itinerary.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* --- Basic Information --- */}
            <section>
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-500" /> Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trip Name</label>
                  <input type="text" name="title" required placeholder="e.g., Summer Escape to Greece" value={formData.title} onChange={handleInputChange}
                         className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    <input type="text" name="destination" required placeholder="Where are you going?" value={formData.destination} onChange={handleInputChange}
                           className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Travelers Count</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    <input type="number" name="travelers" min="1" required value={formData.travelers} onChange={handleInputChange}
                           className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                      <input type="date" name="startDate" required value={formData.startDate} onChange={handleInputChange}
                             className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                      <input type="date" name="endDate" required value={formData.endDate} onChange={handleInputChange}
                             className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* --- Preferences --- */}
            <section>
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Hotel className="w-5 h-5 text-indigo-500" /> Preferences & Budget
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accommodation</label>
                  <select name="accommodation" value={formData.accommodation} onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white">
                    <option value="hotel">Hotel</option>
                    <option value="hostel">Hostel</option>
                    <option value="airbnb">Airbnb/Apartment</option>
                    <option value="resort">Resort</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transport Mode</label>
                  <div className="relative">
                    <Plane className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    <select name="transport" value={formData.transport} onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white">
                      <option value="flight">Flight</option>
                      <option value="train">Train</option>
                      <option value="bus">Bus</option>
                      <option value="car">Car Rental</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget (Total)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    <input type="number" name="budget" placeholder="e.g., 2000" required value={formData.budget} onChange={handleInputChange}
                           className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" />
                  </div>
                </div>
              </div>
            </section>

            {/* --- Interests & Activities --- */}
            <section>
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-500" /> Interests & Activities
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {INTERESTS.map((interest) => (
                  <label key={interest} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none
                    ${formData.interests.includes(interest) ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <input type="checkbox" className="hidden" checked={formData.interests.includes(interest)} onChange={() => handleInterestChange(interest)} />
                    {formData.interests.includes(interest) ? '✅' : '⬜'} {interest}
                  </label>
                ))}
              </div>
            </section>

            {/* --- Trip Cover Image --- */}
            {/* <section>
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-500" /> Trip Cover Image
              </h3>
              <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-indigo-500 transition-colors group">
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className="space-y-2">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {image ? image.name : "Click to upload a cover image"}
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </section> */}

            {/* --- Trip Notes --- */}
            <section>
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" /> Trip Notes
              </h3>
              <textarea name="notes" rows={4} placeholder="Write any special requests, allergies, or must-visit spots..." value={formData.notes} onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"></textarea>
            </section>

            {/* --- Form Actions --- */}
            <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-4 pt-6 border-t border-gray-100">
              <button type="button" onClick={() => navigate('/dashboard')} className="w-full md:w-auto px-8 py-4 text-gray-500 font-bold rounded-xl hover:bg-gray-100 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="w-full md:w-auto px-12 py-4 bg-[#10b981] text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:bg-green-600 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                {isSubmitting ? 'Creating...' : 'Save Trip & Continue'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTripPage;
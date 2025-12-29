import React, { useState } from 'react';
// import toast from 'react-hot-toast'; 
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Calendar, User, DollarSign, 
  Briefcase, Hotel, Plane, CheckCircle, FileText, X 
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); 
  // Error state to act as our "DTO Validation" feedback
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing again
    if (errors[name]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  /**
   * DTO-style Validation Logic
   * SOLID: Separates validation rules from the API submission logic
   */
  const validateTripData = () => {
    const newErrors: Record<string, string> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = formData.startDate ? new Date(formData.startDate) : null;
    const end = formData.endDate ? new Date(formData.endDate) : null;

    if (!start) newErrors.startDate = "Start date is required";
    else if (start < today) newErrors.startDate = "Start date cannot be in the past";

    if (!end) newErrors.endDate = "End date is required";
    else if (start && end < start) newErrors.endDate = "End date cannot be before start date";

    if (formData.title.length < 3) newErrors.title = "Title must be at least 3 characters";
    if (!formData.destination) newErrors.destination = "Destination is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInterestChange = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trigger our DTO-style validation
    if (!validateTripData()) return;

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

      const response = await axios.post(`${API_URL}/api/plantrips`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.status === 201) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/dashboard'); 
        }, 2000);
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
      {/* Success Modal */}
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
        <button 
          onClick={() => navigate('/dashboard')}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="py-10 px-8 md:px-12">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-extrabold text-indigo-700 mb-3">Plan Your New Adventure</h1>
            <p className="text-gray-500 text-base max-w-xl mx-auto">Fill out the details to create your itinerary.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Basic Information */}
            <section>
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-500" /> Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trip Name</label>
                  <input type="text" name="title" placeholder="e.g., Summer Escape" value={formData.title} onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.title ? 'border-red-500 bg-red-50' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-indigo-500`} />
                  {errors.title && <span className="text-red-500 text-xs mt-1">{errors.title}</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    <input type="text" name="destination" placeholder="Where to?" value={formData.destination} onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border ${errors.destination ? 'border-red-500 bg-red-50' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-indigo-500`} />
                  </div>
                  {errors.destination && <span className="text-red-500 text-xs mt-1">{errors.destination}</span>}
                </div>
                
                {/* Dates Section */}
                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                      <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange}
                        min={new Date().toISOString().split("T")[0]}
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border ${errors.startDate ? 'border-red-500 bg-red-50' : 'border-gray-200'} focus:ring-2 focus:ring-indigo-500 outline-none`} />
                    </div>
                    {errors.startDate && <span className="text-red-500 text-xs mt-1">{errors.startDate}</span>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                      <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange}
                        min={formData.startDate || new Date().toISOString().split("T")[0]}
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border ${errors.endDate ? 'border-red-500 bg-red-50' : 'border-gray-200'} focus:ring-2 focus:ring-indigo-500 outline-none`} />
                    </div>
                    {errors.endDate && <span className="text-red-500 text-xs mt-1">{errors.endDate}</span>}
                  </div>
                </div>
              </div>
            </section>

            {/* Other sections remain largely the same, but using the base layout... */}
            {/* Preferences & Budget Section */}
            <section>
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Hotel className="w-5 h-5 text-indigo-500" /> Preferences & Budget
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Travelers</label>
                  <input type="number" name="travelers" min="1" value={formData.travelers} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transport</label>
                  <select name="transport" value={formData.transport} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none bg-white">
                    <option value="flight">Flight</option>
                    <option value="train">Train</option>
                    <option value="car">Car Rental</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                  <input type="number" name="budget" placeholder="2000" value={formData.budget} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" />
                </div>
              </div>
            </section>

            {/* Interests Section */}
            <section>
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-500" /> Interests
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {INTERESTS.map((interest) => (
                  <label key={interest} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none
                    ${formData.interests.includes(interest) ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600'}`}>
                    <input type="checkbox" className="hidden" checked={formData.interests.includes(interest)} onChange={() => handleInterestChange(interest)} />
                    {formData.interests.includes(interest) ? '✅' : '⬜'} {interest}
                  </label>
                ))}
              </div>
            </section>

            <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-4 pt-6 border-t border-gray-100">
              <button type="button" onClick={() => navigate('/dashboard')} className="w-full md:w-auto px-8 py-4 text-gray-500 font-bold rounded-xl hover:bg-gray-100">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="w-full md:w-auto px-12 py-4 bg-[#10b981] text-white font-bold rounded-xl shadow-lg hover:bg-green-600 disabled:opacity-70">
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
// src/modules/auth/pages/GuideStatusPage.tsx
import { useNavigate } from 'react-router-dom';
import { Clock, LayoutDashboard, FileText } from 'lucide-react';

export const GuideStatusPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="font-bold text-xl text-slate-800">Guide Application Status</h1>
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 mr-2" /> Go to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-20">
        <div className="bg-white p-10 rounded-2xl shadow-2xl text-center border-t-8 border-amber-500">
          <div className="mx-auto w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 border-4 border-amber-500/20">
            <Clock className="w-10 h-10 text-amber-500" />
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
            Application Received!
          </h1>
          
          <p className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-6 py-1.5 px-4 inline-block rounded-full bg-amber-50 border border-amber-200">
            Status: Pending Review
          </p>

          <p className="text-gray-600 max-w-md mx-auto leading-relaxed text-lg">
            Thank you for applying to join the Trip Buddy Guide Network. Your application is now being reviewed by our verification team.
          </p>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-6">
              We aim to complete the review process within <span className="font-bold text-gray-700">48 hours</span>. You will receive an email notification once your status changes.
            </p>
            <button className="flex items-center justify-center mx-auto px-8 py-3 bg-[#5537ee] text-white text-lg font-bold rounded-xl shadow-lg hover:bg-opacity-90 transition duration-300">
              <FileText className="w-5 h-5 mr-2" /> View Application Details
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
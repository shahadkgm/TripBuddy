import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, LayoutDashboard, XCircle, RefreshCcw, ArrowLeft } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { authService } from '../../services/auth.service';

interface GuideStatusPageProps {
  status: 'pending' | 'rejected' | 'verified';
  reason?: string;
  onReapply?: () => void;
}

export const GuideStatusPage: React.FC<GuideStatusPageProps> = ({ status, reason, onReapply }) => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleReapply = async () => {
    if (!user) return;
    try {
      await api.patch('/api/guides/reset-status');
      toast.success('You can now resubmit your application');
      if (onReapply) onReapply();
    } catch (_err) {
      toast.error('Failed to reset application');
    }
  };

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
        {status === 'rejected' ? (
          <div className="bg-white p-10 rounded-2xl shadow-2xl text-center border-t-8 border-red-500 animate-in slide-in-from-bottom-4 duration-500">
            <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 border-4 border-red-500/20">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Application Declined</h1>

            <p className="text-sm font-bold text-red-600 uppercase tracking-widest mb-6 py-1.5 px-4 inline-block rounded-full bg-red-50 border border-red-200">
              Status: Rejected
            </p>

            <div className="bg-red-50/50 p-6 rounded-xl border border-red-100 mb-8 max-w-md mx-auto">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">
                Reason for Rejection
              </p>
              <p className="text-slate-700 font-medium leading-relaxed italic">
                "
                {reason ||
                  'No specific reason provided. Please contact support for more information.'}
                "
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pt-8 border-t border-gray-100">
              <button
                onClick={handleReapply}
                className="w-full sm:w-auto flex items-center justify-center px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition active:scale-95 gap-2"
              >
                <RefreshCcw className="w-4 h-4" /> Edit & Reapply
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto flex items-center justify-center px-8 py-3 bg-white text-slate-600 border border-slate-200 font-bold rounded-xl hover:bg-slate-50 transition active:scale-95 gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-10 rounded-2xl shadow-2xl text-center border-t-8 border-amber-500">
            <div className="mx-auto w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 border-4 border-amber-500/20">
              <Clock className="w-10 h-10 text-amber-500" />
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Application Received!</h1>

            <p className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-6 py-1.5 px-4 inline-block rounded-full bg-amber-50 border border-amber-200">
              Status: Pending Review
            </p>

            <p className="text-gray-600 max-w-md mx-auto leading-relaxed text-lg">
              Thank you for applying to join the Trip Buddy Guide Network. Your application is now
              being reviewed by our verification team.
            </p>

            <div className="mt-10 pt-8 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500 mb-6">
                We aim to complete the review process within{' '}
                <span className="font-bold text-gray-700">48 hours</span>. You will receive an email
                notification once your status changes.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

import React, { useState } from 'react';
import { AlertTriangle, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { reportService } from '../../services/c.report.service';

interface ReportModalProps {
  tripId: string;
  targetId: string;
  targetType: 'guide' | 'organizer';
  targetName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  tripId,
  targetId,
  targetType,
  targetName,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportReasons = [
    'Inappropriate Behavior',
    'Safety Concern',
    'Financial Issue / Scam',
    'Unprofessional Conduct',
    'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast.error('Please select a reason for reporting');
      return;
    }
    if (!description.trim()) {
      toast.error('Please provide a brief description');
      return;
    }

    setIsSubmitting(true);
    try {
      await reportService.submitReport({
        tripId,
        targetId,
        targetType,
        reason,
        description,
      });
      toast.success(`Report submitted. Our team will investigate this ${targetType}.`);
      onSuccess?.();
      onClose();
    } catch (_err: unknown) {
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className="relative p-8 text-center border-b border-slate-100">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition"
          >
            <X size={24} />
          </button>

          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={40} className="text-rose-600" />
          </div>

          <h2 className="text-2xl font-black text-slate-800 mb-2">
            Report {targetType === 'guide' ? 'Guide' : 'Organizer'}
          </h2>
          <p className="text-slate-500 text-sm">
            Reporting <strong>{targetName}</strong> for issues during the trip. This report will be sent directly to TripBuddy Admins.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-700 uppercase tracking-widest px-1">
              Why are you reporting?
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer appearance-none"
            >
              <option value="">Select a reason</option>
              {reportReasons.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-700 uppercase tracking-widest px-1">
              Details
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Please provide more details about the incident..."
              rows={4}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-rose-600 text-white rounded-2xl py-4 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-slate-900 transition shadow-lg shadow-rose-100 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={16} />
                Submit Report
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};



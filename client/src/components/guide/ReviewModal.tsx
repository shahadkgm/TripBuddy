import React, { useState } from 'react';
import { Star, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

interface ReviewModalProps {
  tripId: string;
  onClose: () => void;
  onSuccess: () => void;
  target?: 'organizer' | 'guide';
  targetName?: string;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  tripId,
  onClose,
  onSuccess,
  target = 'organizer',
  targetName,
}) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please add a comment');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/api/reviews', { tripId, rating, comment, target });
      toast.success(`Thank you for reviewing the ${target}!`);
      onSuccess();
      onClose();
    } catch (_err: unknown) {
      const errorObj = _err as { response?: { data?: { message?: string } } };
      const msg = errorObj.response?.data?.message || 'Failed to submit review';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="relative p-8 text-center border-b border-slate-100">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition"
          >
            <X size={24} />
          </button>

          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Star size={40} className="text-indigo-600 fill-indigo-600" />
          </div>

          <h2 className="text-2xl font-black text-slate-800 mb-2">
            Review {target === 'guide' ? 'your Guide' : targetName ? targetName : 'the Trip'}
          </h2>
          <p className="text-slate-500">
            {target === 'guide'
              ? 'Share your experience with the local expert who assisted your group.'
              : 'Your feedback helps fellow travelers and organizers improve their experience.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Select Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="p-1 transition-transform active:scale-95"
                >
                  <Star
                    size={36}
                    className={`transition-colors duration-200 ${
                      (hover || rating) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200 fill-transparent'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Share your thoughts
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Tell us about the highlights, the organizer, or anything that could be better..."
              rows={4}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={20} />
                Submit Review
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full text-slate-400 text-sm font-medium hover:text-slate-600 transition"
          >
            Maybe later
          </button>
        </form>
      </div>
    </div>
  );
};

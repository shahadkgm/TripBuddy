import { Star, Trash2, MapPin, User, Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../components/ConfirmModal';

interface Review {
  _id: string;
  tripId: {
    _id: string;
    destination: string;
  };
  reviewerId: {
    _id: string;
    name: string;
    avatarURL?: string;
  };
  organizerId: {
    _id: string;
    name: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

export const ReviewManagementPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reviewToDeleteId, setReviewToDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const res = await api.get('/api/reviews/admin/all');
      setReviews(res.data.data);
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!reviewToDeleteId) return;

    try {
      await api.delete(`/api/reviews/${reviewToDeleteId}`);
      toast.success('Review deleted');
      setReviews(prev => prev.filter(r => r._id !== reviewToDeleteId));
    } catch (err) {
      toast.error('Failed to delete review');
    } finally {
      setShowDeleteConfirm(false);
      setReviewToDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              Review Management
            </h1>
            <p className="text-slate-500 font-medium">
              Monitor and manage traveler feedback across the platform.
            </p>
          </div>
        </header>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No reviews found</h3>
            <p className="text-slate-500">
              Reviews will appear here once travelers complete their trips.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map(review => (
              <div
                key={review._id}
                className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl overflow-hidden shadow-inner">
                      {review.reviewerId.avatarURL ? (
                        <img
                          src={review.reviewerId.avatarURL}
                          alt={review.reviewerId.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-600 font-bold">
                          {review.reviewerId.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 line-clamp-1">
                        {review.reviewerId.name}
                      </h4>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i < review.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200 fill-slate-200'
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setReviewToDeleteId(review._id);
                      setShowDeleteConfirm(true);
                    }}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <ConfirmModal
                  isOpen={showDeleteConfirm}
                  onClose={() => setShowDeleteConfirm(false)}
                  onConfirm={handleDelete}
                  title="Delete Review?"
                  message="Are you sure you want to delete this review? This action cannot be undone and will be removed from the organizer's profile."
                  confirmText="Yes, Delete Review"
                  type="danger"
                />

                <div className="flex-1 bg-slate-50/50 rounded-2xl p-4 mb-4 border border-slate-50">
                  <p className="text-slate-600 text-sm leading-relaxed italic">
                    "{review.comment}"
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <MapPin size={12} className="text-indigo-400" />
                    <span>Trip to {review.tripId?.destination || 'Deleted Trip'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <User size={12} className="text-indigo-400" />
                    <span>Organizer: {review.organizerId?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <Calendar size={12} className="text-indigo-400" />
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Star,
  MessageSquare,
  Loader2,
  Quote,
  ThumbsUp,
} from 'lucide-react';
import { authService } from '../../services/c.authService';
import { GuideLayout } from './GuideLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';

interface Review {
  _id: string;
  reviewerId: {
    name: string;
    avatarURL?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

export const GuideReviewsPage = () => {
  const user = authService.getCurrentUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: [0, 0, 0, 0, 0],
  });

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user?.guideProfile?._id) return;
      try {
        const res = await api.get(`/api/reviews/guide/${user.guideProfile._id}`);
        const reviewData = res.data.data;
        setReviews(reviewData);

        if (reviewData.length > 0) {
          const total = reviewData.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0);
          const avg = total / reviewData.length;

          const dist = [0, 0, 0, 0, 0];
          reviewData.forEach((r: { rating: number }) => {
            if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++;
          });

          setStats({
            averageRating: avg,
            totalReviews: reviewData.length,
            ratingDistribution: dist.reverse(), // 5 to 1
          });
        }
      } catch (_err: unknown) {
        const errorObj = _err as { response?: { data?: { message?: string } } };
        toast.error(errorObj?.response?.data?.message || 'Failed to update guide assignment');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [user?.guideProfile?._id]);

  return (
    <GuideLayout currentPage="Reviews">
      <div className="p-0">
          <header className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Public Feedback</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">
              What travelers are saying about you
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Rating Summary */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                Average Rating
              </p>
              <h2 className="text-7xl font-black text-slate-900 leading-none">
                {stats.averageRating.toFixed(1)}
              </h2>
              <div className="flex gap-1.5 my-6">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    size={20}
                    className={
                      s <= Math.round(stats.averageRating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-100 fill-slate-100'
                    }
                  />
                ))}
              </div>
              <p className="text-xs font-bold text-slate-500">
                Based on {stats.totalReviews} verified reviews
              </p>
            </div>

            {/* Rating Bars */}
            <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-center">
              <div className="space-y-4">
                {stats.ratingDistribution.map((count, idx) => {
                  const rating = 5 - idx;
                  const percentage =
                    stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                  return (
                    <div key={rating} className="flex items-center gap-4">
                      <div className="flex items-center gap-2 w-12">
                        <span className="text-xs font-black text-slate-400">{rating}</span>
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                      </div>
                      <div className="flex-1 h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 w-8">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                Loading reviews...
              </p>
            </div>
          ) : reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map(review => (
                <div
                  key={review._id}
                  className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 relative"
                >
                  <Quote
                    className="absolute top-8 right-8 text-slate-50 opacity-[0.05]"
                    size={80}
                  />

                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src={
                        review.reviewerId?.avatarURL ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.reviewerId?.name}`
                      }
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-50 shadow-sm"
                      alt=""
                    />
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                        {review.reviewerId?.name}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          size={10}
                          className={
                            s <= review.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-100 fill-slate-100'
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm font-medium leading-relaxed italic mb-6">
                    "{review.comment}"
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500">
                        <MessageSquare size={12} />
                      </div>
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                        Verified Trip Member
                      </span>
                    </div>
                    <button className="text-slate-300 hover:text-indigo-500 transition-colors">
                      <ThumbsUp size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 p-24 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Star className="text-slate-200" size={48} />
              </div>
              <h4 className="text-2xl font-black text-slate-900 tracking-tight">No feedback yet</h4>
              <p className="text-slate-400 font-medium max-w-xs mx-auto mt-4">
                Complete trips and provide excellent service to start receiving reviews from
                travelers.
              </p>
            </div>
          )}
        </div>
    </GuideLayout>
  );
};

import { useState, useEffect } from 'react';
import { Map, Search, XCircle, CheckCircle, Clock, Star, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminLayout } from '../../components/admin/AdminLayout';
import api from '../../utils/api';
import { DataTable } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import { ConfirmModal } from '../../components/ConfirmModal';

interface TripUser {
  _id: string;
  name: string;
  email: string;
  avatarURL?: string;
}

interface TripData {
  _id: string;
  userId: TripUser;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget?: number;
  status: string;
  members: string[];
  minMembers: number;
  preferences?: {
    travelers: number;
    accommodation: string;
    transport: string;
  };
  createdAt: string;
  guideId?: {
    _id: string;
    userId: {
      name: string;
    };
  };
}

interface Review {
  _id: string;
  reviewerId: {
    name: string;
    avatarURL?: string;
  };
  rating: number;
  comment: string;
  target?: string;
  createdAt: string;
}

const STATUS_OPTIONS = ['planned', 'ongoing', 'completed', 'cancelled', 'finalized', 'confirmed'];

const statusStyles: Record<string, string> = {
  planned: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  finalized: 'bg-purple-100 text-purple-700',
  confirmed: 'bg-teal-100 text-teal-700',
};

export const AdminTripManagementPage = () => {
  const [trips, setTrips] = useState<TripData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTrips, setTotalTrips] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<{ tripId: string; status: string; title: string } | null>(null);
  
  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedTripReviews, setSelectedTripReviews] = useState<Review[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [activeTripTitle, setActiveTripTitle] = useState('');

  const limit = 8;

  useEffect(() => {
    fetchTrips();
  }, [currentPage, searchTerm]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/admin/trips', {
        params: { page: currentPage, limit, search: searchTerm },
      });
      setTrips(data.data.trips);
      setTotalPages(data.data.totalPages);
      setTotalTrips(data.data.totalTrips);
    } catch (err) {
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const confirmStatusUpdate = (trip: TripData, status: string) => {
    setSelectedAction({ tripId: trip._id, status, title: trip.title });
    setIsModalOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedAction) return;
    try {
      await api.patch(`/api/admin/trips/${selectedAction.tripId}/status`, {
        status: selectedAction.status,
      });
      toast.success(`Trip status updated to "${selectedAction.status}"`);
      setTrips((prev) =>
        prev.map((t) =>
          t._id === selectedAction.tripId ? { ...t, status: selectedAction.status } : t
        )
      );
    } catch (err) {
      toast.error('Failed to update trip status');
    } finally {
      setIsModalOpen(false);
      setSelectedAction(null);
    }
  };

  const openReviews = async (trip: TripData) => {
    setActiveTripTitle(trip.title);
    setIsReviewModalOpen(true);
    setIsReviewsLoading(true);
    try {
      const { data } = await api.get(`/api/reviews/trip/${trip._id}`);
      setSelectedTripReviews(data.data);
    } catch (err) {
      toast.error('Failed to load reviews');
      setIsReviewModalOpen(false);
    } finally {
      setIsReviewsLoading(false);
    }
  };

  const columns = [
    {
      header: 'Trip',
      key: 'title',
      render: (trip: TripData) => (
        <div className="max-w-[200px]">
          <div className="font-semibold text-gray-800 text-sm truncate">{trip.title}</div>
          <div className="text-xs text-gray-500 truncate">📍 {trip.destination}</div>
        </div>
      ),
    },
    {
      header: 'Organizer',
      key: 'userId',
      render: (trip: TripData) => (
        <div className="flex items-center gap-2 max-w-[180px]">
          {trip.userId?.avatarURL ? (
            <img
              src={
                trip.userId.avatarURL.startsWith('http')
                  ? trip.userId.avatarURL
                  : `${api.defaults.baseURL}/${trip.userId.avatarURL}`
              }
              alt={trip.userId.name}
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold shrink-0">
              {trip.userId?.name?.charAt(0) || 'U'}
            </div>
          )}
          <div className="truncate">
            <div className="text-sm font-medium text-gray-800 truncate">{trip.userId?.name || 'Unknown'}</div>
            <div className="text-xs text-gray-500 truncate">{trip.userId?.email || 'N/A'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Dates',
      key: 'startDate',
      className: 'hidden md:table-cell',
      render: (trip: TripData) => (
        <div className="text-xs text-gray-600">
          <div>{new Date(trip.startDate).toLocaleDateString()}</div>
          <div className="text-gray-400">→ {new Date(trip.endDate).toLocaleDateString()}</div>
        </div>
      ),
    },
    {
      header: 'Members',
      key: 'members',
      className: 'text-center hidden sm:table-cell',
      render: (trip: TripData) => (
        <span className="text-sm font-medium text-gray-700">
          {trip.members?.length ?? 0} / {trip.minMembers}
        </span>
      ),
    },
    {
      header: 'Budget',
      key: 'budget',
      className: 'text-right hidden lg:table-cell',
      render: (trip: TripData) => (
        <span className="text-sm font-bold text-gray-800">
          {trip.budget ? `₹${trip.budget.toLocaleString()}` : '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      className: 'text-center',
      render: (trip: TripData) => (
        <span
          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyles[trip.status] || 'bg-gray-100 text-gray-700'}`}
        >
          {trip.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right',
      render: (trip: TripData) => (
        <div className="flex justify-end gap-2">
          {trip.status === 'completed' && (
            <button
              onClick={() => openReviews(trip)}
              className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
              title="View Reviews"
            >
              <Star size={16} />
            </button>
          )}
          {trip.status !== 'cancelled' && trip.status !== 'completed' && (
            <button
              onClick={() => confirmStatusUpdate(trip, 'cancelled')}
              className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition"
              title="Cancel Trip"
            >
              <XCircle size={16} />
            </button>
          )}
          {trip.status === 'planned' && (
            <button
              onClick={() => confirmStatusUpdate(trip, 'confirmed')}
              className="p-1.5 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition"
              title="Confirm Trip"
            >
              <CheckCircle size={16} />
            </button>
          )}
          {trip.status === 'confirmed' && (
            <button
              onClick={() => confirmStatusUpdate(trip, 'ongoing')}
              className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition"
              title="Mark as Ongoing"
            >
              <Clock size={16} />
            </button>
          )}
          {trip.status === 'ongoing' && (
            <button
              onClick={() => confirmStatusUpdate(trip, 'completed')}
              className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition"
              title="Mark as Completed"
            >
              <CheckCircle size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Trip Management</h2>
            <p className="text-sm text-gray-500">
              {totalTrips > 0 ? `${totalTrips} total trips` : 'Monitor and manage all platform trips'}
            </p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by title or destination..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#5537ee] text-sm"
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="bg-[#f0f9ff] p-2.5 rounded-xl text-[#5537ee] hidden sm:block">
              <Map size={20} />
            </div>
          </div>
        </div>

        {/* Status Filter Badges */}
        <div className="px-6 py-3 border-b border-gray-50 flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((s) => (
            <span
              key={s}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-default ${statusStyles[s] || 'bg-gray-100 text-gray-700'}`}
            >
              {s}
            </span>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={trips}
          loading={loading}
          emptyMessage="No trips found."
        />

        <div className="p-4 border-t bg-gray-50/50">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleStatusUpdate}
        title="Update Trip Status"
        message={`Are you sure you want to change "${selectedAction?.title}" status to "${selectedAction?.status}"?`}
        confirmText="Yes, Update"
        type={selectedAction?.status === 'cancelled' ? 'danger' : 'info'}
      />

      {/* Reviews Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Trip Reviews</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{activeTripTitle}</p>
              </div>
              <button 
                onClick={() => setIsReviewModalOpen(false)}
                className="p-2 hover:bg-white rounded-full transition-colors shadow-sm"
              >
                <XCircle size={24} className="text-slate-400" />
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {isReviewsLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-4" />
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Feedback...</p>
                </div>
              ) : selectedTripReviews.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <MessageSquare size={32} className="text-slate-200" />
                  </div>
                  <h4 className="text-lg font-black text-slate-800">No reviews yet</h4>
                  <p className="text-sm text-slate-400 font-medium">This trip hasn't received any feedback from members.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedTripReviews.map((review) => (
                    <div key={review._id} className="bg-slate-50 rounded-[2rem] p-5 border border-slate-200/50">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-indigo-600 shadow-sm border border-slate-100 uppercase overflow-hidden">
                            {review.reviewerId.avatarURL ? (
                              <img src={review.reviewerId.avatarURL} alt="" className="w-full h-full object-cover" />
                            ) : review.reviewerId.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-black text-slate-800">{review.reviewerId.name}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                              {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={14} 
                              className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium bg-white/60 p-4 rounded-2xl border border-white/40 italic">
                        "{review.comment}"
                      </p>
                      {review.target && (
                        <div className="mt-3 flex items-center gap-2">
                           <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-md">
                             Target: {review.target}
                           </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setIsReviewModalOpen(false)}
                className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 transition shadow-lg"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

import { useState, useEffect } from 'react';
import { Map, Search, XCircle, CheckCircle, Clock } from 'lucide-react';
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
          {trip.status !== 'cancelled' && (
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
    </AdminLayout>
  );
};

import { useState, useEffect } from 'react';
import {
  Mail,
  MapPin,
  Calendar,
  ArrowRight,
  Loader2,
  Sparkles,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { guideService } from '../../services/guide.service';
import { GuideLayout } from './GuideLayout';
import { Pagination } from '../../components/Pagination';
import toast from 'react-hot-toast';

export const GuideInvitationsPage = () => {
  const [invitations, setInvitations] = useState<import("../../interface/ITripdetails").IGuideInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const LIMIT = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        if (page === 1) setLoading(true);
        else setPaginationLoading(true);

        const data = await guideService.getInboundInvitations(page, LIMIT);
        setInvitations(data.invitations);
        setTotalPages(Math.ceil(data.total / LIMIT));
      } catch (_err) {
        toast.error('Failed to load invitations');
      } finally {
        setLoading(false);
        setPaginationLoading(false);
      }
    };
    fetchInvitations();
  }, [page]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'accepted':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'rejected':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <GuideLayout currentPage="New Invitations">
      <div className="p-0">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Trip Invitations</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">
            Opportunities from travelers around the world
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Scanning for requests...
            </p>
          </div>
        ) : invitations.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 relative">
            {paginationLoading && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-[3rem]">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              </div>
            )}
            {invitations.map(inv => (
              <div
                key={inv._id}
                className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 group relative overflow-hidden flex flex-col lg:flex-row items-center gap-8"
              >
                {/* Status Badge */}
                <div
                  className={`absolute top-6 right-8 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(inv.status)}`}
                >
                  {inv.status}
                </div>

                {/* Avatar / Icon */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-lg overflow-hidden border-4 border-white">
                    {inv.senderId?.avatarURL ? (
                      <img
                        src={inv.senderId.avatarURL}
                        alt="Sender"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      inv.senderId?.name?.charAt(0) || 'T'
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-md border border-slate-100">
                    <Mail size={14} className="text-indigo-600" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="mb-4">
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">
                      Invitation from {inv.senderId?.name || 'Traveler'}
                    </p>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-tight">
                      {typeof inv.tripId !== 'string' ? inv.tripId?.title : 'Adventure Trip'}
                    </h3>
                  </div>

                  <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-slate-500">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-indigo-400" />
                      <span className="text-xs font-bold uppercase tracking-widest">
                        {typeof inv.tripId !== 'string' ? inv.tripId?.destination : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-indigo-400" />
                      <span className="text-xs font-bold uppercase tracking-widest">
                        {typeof inv.tripId !== 'string' ? new Date(inv.tripId?.startDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-indigo-400" />
                      <span className="text-xs font-bold uppercase tracking-widest italic">
                        {inv.status === 'pending' ? 'Decision Required' : 'Processed'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="shrink-0 w-full lg:w-auto">
                  <button
                    onClick={() => {
                      const tId = typeof inv.tripId === 'string' ? inv.tripId : inv.tripId?._id;
                      navigate(`/guide/trip-request/${tId}/${inv._id}`);
                    }}
                    className="w-full lg:w-auto px-10 py-5 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 active:scale-95 group/btn"
                  >
                    {inv.status === 'pending' ? 'Review & Respond' : 'View Details'}
                    <ArrowRight
                      size={16}
                      className="group-hover/btn:translate-x-1 transition-transform"
                    />
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-8">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </div>
        ) : (
          <div className="py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center px-6">
            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 relative">
              <Mail className="w-10 h-10 text-slate-200" />
              <div className="absolute -bottom-2 -right-2 bg-white p-3 rounded-xl shadow-lg border border-slate-50">
                <Sparkles size={16} className="text-indigo-400" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
              Inbox is Empty
            </h3>
            <p className="text-slate-400 max-w-sm mx-auto mt-4 font-medium">
              You haven't received any trip invitations yet. Make sure your profile is optimized
              to attract travelers!
            </p>
          </div>
        )}
      </div>
    </GuideLayout>
  );
};

import { useEffect, useState } from 'react';
import { connectionService } from '../../services/c.connection.service';
import type { ConnectionRequest } from '../../types/auth.dto';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, UserCheck, UserX, Clock, MessageSquare, Plane } from 'lucide-react';
import toast from 'react-hot-toast';

const ConnectionRequestsPage = () => {
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await connectionService.getPendingRequests();
      setRequests(data);
    } catch (_error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      if (action === 'accept') {
        await connectionService.acceptRequest(requestId);
        toast.success('Connection accepted!');
      } else {
        await connectionService.rejectRequest(requestId);
        toast.success('Request declined');
      }
      setRequests(requests.filter(req => req._id !== requestId));
    } catch (_error) {
      toast.error('Action failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <style>{`
                @keyframes crp-spin { to { transform: rotate(360deg); } }
                .crp-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid #c0d4ff;
                    border-top-color: #1a5cff;
                    border-radius: 50%;
                    animation: crp-spin 0.8s linear infinite;
                }

                .crp-card {
                    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
                }
                .crp-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 32px rgba(99, 102, 241, 0.12);
                    border-color: #a5b4fc !important;
                }

                .crp-btn-accept {
                    transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
                }
                .crp-btn-accept:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35) !important;
                    background-color: #4338ca !important;
                }

                .crp-btn-decline {
                    transition: transform 0.2s ease, background-color 0.2s ease, color 0.2s ease;
                }
                .crp-btn-decline:hover {
                    transform: translateY(-2px);
                }
            `}</style>
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 mb-8 text-slate-500 hover:text-indigo-600 transition-all font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Profile
        </button>

        <header className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900">Connection Requests</h1>
          <p className="text-slate-500 mt-2">People who want to travel with you</p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="crp-spinner"></div>
          </div>
        ) : requests.length > 0 ? (
          <div className="grid gap-4">
            {requests.map(request => (
              <div
                key={request._id}
                className="crp-card bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={
                      request.senderId.avatarURL ||
                      `https://i.pravatar.cc/150?u=${request.senderId._id}`
                    }
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-50"
                    alt={request.senderId.name}
                  />
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{request.senderId.name}</h3>
                    <div className="flex flex-col gap-0.5">
                      {request.tripId ? (
                        <p className="text-indigo-600 text-xs font-bold flex items-center gap-1">
                          <Plane size={12} /> Trip: {request.tripId.title} (
                          {request.tripId.destination})
                        </p>
                      ) : (
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                          General connection
                        </p>
                      )}
                      <p className="text-slate-400 text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Received {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction(request._id, 'reject')}
                    className="crp-btn-decline p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-rose-50 hover:text-rose-500"
                    title="Decline"
                  >
                    <UserX className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => handleAction(request._id, 'accept')}
                    className="crp-btn-accept px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 flex items-center gap-2"
                  >
                    <UserCheck className="w-5 h-5" />
                    Accept Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No pending requests</h3>
            <p className="text-slate-500">When someone wants to connect, they'll appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionRequestsPage;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notification.service';
import type { INotification } from '../../services/notification.service';
import { Bell, Trash2, ArrowLeft, Loader2, Check } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getUserNotifications();
      setNotifications(data);
    } catch (_error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: INotification) => {
    try {
      // "delete after seen"
      await notificationService.deleteNotification(notification._id);
      setNotifications(prev => prev.filter(n => n._id !== notification._id));
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      if (notification.link) {
        navigate(notification.link);
      }
    } catch (_error) {
      console.error(_error);
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationService.deleteAllNotifications();
      setNotifications([]);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications cleared');
    } catch (_error) {
      toast.error('Failed to clear notifications');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Bell size={24} />
              </div>
              <h1 className="text-2xl font-black">Notifications</h1>
            </div>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} />
              Clear All
            </button>
          )}
        </div>

        {/* List */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Check size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">You're all caught up!</h3>
              <p className="text-slate-500 mt-2">Check back later for new notifications.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map(notif => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className="group flex items-start gap-4 p-4 sm:p-6 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 rounded-2xl cursor-pointer transition-all active:scale-[0.98]"
                >
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                    <Bell size={20} />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                      {notif.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-2">
                      {notif.message}
                    </p>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-400 mt-3 block uppercase tracking-wider">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

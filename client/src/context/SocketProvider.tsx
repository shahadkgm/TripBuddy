import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { authService } from '../services/c.authService';
import { tripService } from '../services/c.trip.service';
import toast from 'react-hot-toast';
import { MessageSquare } from 'lucide-react';
import type { IMessage } from '../interface/IMessage';

import { SocketContext } from './SocketContext';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const tripTitlesRef = useRef<Record<string, string>>({});

  const currentUser = authService.getCurrentUser();
  const currentChatIdRef = useRef<string | null>(null);

  const markAsRead = (tripId: string) => {
    setUnreadCounts(prev => ({
      ...prev,
      [tripId]: 0,
    }));
  };

  // Keep ref in sync for the event listener
  useEffect(() => {
    currentChatIdRef.current = currentChatId;
    if (currentChatId) {
      // Defer to avoid synchronous setState warning
      Promise.resolve().then(() => markAsRead(currentChatId));
    }
  }, [currentChatId]);

  useEffect(() => {
    if (!currentUser) {
      if (socket) {
        socket.disconnect();
        Promise.resolve().then(() => setSocket(null));
      }
      return;
    }

    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      query: { userId: currentUser.id },
    });

    Promise.resolve().then(() => setSocket(newSocket));

    // Join all user's/guide's trip rooms for global notifications
    const joinAllRooms = async () => {
      try {
        // User trips
        const userTrips = await tripService.getUserTrips(currentUser.id, 1, 100);
        userTrips.trips.forEach(trip => {
          newSocket.emit('join_trip', trip._id);
          tripTitlesRef.current[trip._id] = trip.title;
        });

        // Guide trips
        if (currentUser.guideProfile?._id) {
          const guideTrips = await tripService.getGuideTrips(currentUser.guideProfile._id, 1, 100);
          guideTrips.trips.forEach(trip => {
            newSocket.emit('join_trip', trip._id);
            tripTitlesRef.current[trip._id] = trip.title;
          });
        }
      } catch (_error) {
        console.error(_error);
      }
    };

    joinAllRooms();

    newSocket.on('receive_message', (message: IMessage) => {
      const incomingTripId = String(message.tripId);
      const activeTripId = currentChatIdRef.current ? String(currentChatIdRef.current) : null;
      const senderId = String(message.senderId._id);
      const myId = String(currentUser?.id || '');

      if (incomingTripId !== activeTripId && senderId !== myId && myId !== '') {
        // Increment unread count
        setUnreadCounts(prev => ({
          ...prev,
          [incomingTripId]: (prev[incomingTripId] || 0) + 1,
        }));

        const tripTitle = tripTitlesRef.current[incomingTripId] || 'Trip Update';

        toast.custom(
          t => (
            <div
              className={`${t.visible ? 'animate-in fade-in slide-in-from-top-4' : 'animate-out fade-out slide-out-to-top-2'} max-w-sm w-full bg-slate-900 shadow-2xl rounded-3xl pointer-events-auto flex ring-1 ring-white/10 overflow-hidden`}
            >
              <div className="flex-1 w-0 p-5">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <div className="h-10 w-10 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                      <MessageSquare size={20} />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-1">
                      New in {tripTitle}
                    </p>
                    <p className="text-sm font-bold text-white line-clamp-1">
                      {message.senderId.name}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-400 line-clamp-2 italic">
                      "
                      {message.content.length > 60
                        ? message.content.substring(0, 60) + '...'
                        : message.content}
                      "
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col border-l border-white/5 bg-white/5">
                <button
                  onClick={() => {
                    window.location.replace(`/group-chat/${incomingTripId}`);
                    toast.dismiss(t.id);
                  }}
                  className="w-full flex-1 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white px-6 transition-colors"
                >
                  Open
                </button>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full flex-1 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white px-6 border-t border-white/5 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ),
          { duration: 6000, position: 'top-right' }
        );
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser?.id]);

  const totalUnread = Object.values(unreadCounts).reduce((acc, curr) => acc + curr, 0);

  useEffect(() => {
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) New Messages | TripBuddy`;
    } else {
      document.title = 'TripBuddy | Your Adventure Partner';
    }
  }, [totalUnread]);

  return (
    <SocketContext.Provider
      value={{ socket, currentChatId, setCurrentChatId, unreadCounts, totalUnread, markAsRead }}
    >
      {children}
    </SocketContext.Provider>
  );
};



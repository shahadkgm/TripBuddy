import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { authService } from '../services/c.authService';
import { tripService } from '../services/c.trip.service';
import toast from 'react-hot-toast';
import type { IMessage } from '../interface/IMessage';

interface SocketContextType {
    socket: Socket | null;
    currentChatId: string | null;
    setCurrentChatId: (id: string | null) => void;
    unreadCounts: Record<string, number>;
    markAsRead: (tripId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    const tripTitlesRef = useRef<Record<string, string>>({});
    
    const currentUser = authService.getCurrentUser();
    const currentChatIdRef = useRef<string | null>(null);

    // Keep ref in sync for the event listener
    useEffect(() => {
        currentChatIdRef.current = currentChatId;
        if (currentChatId) {
            markAsRead(currentChatId);
        }
    }, [currentChatId]);

    const markAsRead = (tripId: string) => {
        setUnreadCounts(prev => ({
            ...prev,
            [tripId]: 0
        }));
    };

    useEffect(() => {
        if (!currentUser) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        const newSocket = io(SOCKET_URL, {
            withCredentials: true,
            query: { userId: currentUser.id }
        });

        setSocket(newSocket);

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
             } catch (error) {
                console.error("Error joining rooms:", error);
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
                    [incomingTripId]: (prev[incomingTripId] || 0) + 1
                }));

                const tripTitle = tripTitlesRef.current[incomingTripId] || 'Trip Update';
                
                toast.success(` New message from ${tripTitle}`, {
                    duration: 5000,
                    position: 'top-right',
                    style: {
                        background: '#1e293b',
                        color: '#fff',
                        borderRadius: '1.25rem',
                        padding: '1rem',
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                    },
                    icon: '🚀'
                });
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, [currentUser?.id]);

    return (
        <SocketContext.Provider value={{ socket, currentChatId, setCurrentChatId, unreadCounts, markAsRead }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocketContext = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocketContext must be used within a SocketProvider');
    }
    return context;
};

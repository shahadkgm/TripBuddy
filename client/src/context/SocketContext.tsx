import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { authService } from '../services/c.authService';
import toast from 'react-hot-toast';
import type { IMessage } from '../interface/IMessage';

interface SocketContextType {
    socket: Socket | null;
    currentChatId: string | null;
    setCurrentChatId: (id: string | null) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const currentUser = authService.getCurrentUser();
    const currentChatIdRef = useRef<string | null>(null);

    // Keep ref in sync for the event listener
    useEffect(() => {
        currentChatIdRef.current = currentChatId;
    }, [currentChatId]);

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

        newSocket.on('receive_message', (message: IMessage) => {
            const incomingTripId = String(message.tripId);
            const activeTripId = currentChatIdRef.current ? String(currentChatIdRef.current) : null;
            const senderId = String(message.senderId._id);
            const myId = String(currentUser?.id || '');

            if (incomingTripId !== activeTripId && senderId !== myId && myId !== '') {
                toast.success(`Trip Update: New message from ${message.senderId.name}`, {
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
        <SocketContext.Provider value={{ socket, currentChatId, setCurrentChatId }}>
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

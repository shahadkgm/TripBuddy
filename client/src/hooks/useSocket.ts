import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

export const useSocket = (tripId: string | undefined) => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (!tripId) return;

        const newSocket = io(SOCKET_URL, {
            withCredentials: true,
        });

        setSocket(newSocket);

        newSocket.emit('join_trip', tripId);

        return () => {
            newSocket.disconnect();
        };
    }, [tripId]);

    return socket;
};

import { createContext } from 'react';
import { Socket } from 'socket.io-client';

export interface SocketContextType {
  socket: Socket | null;
  currentChatId: string | null;
  setCurrentChatId: (id: string | null) => void;
  unreadCounts: Record<string, number>;
  totalUnread: number;
  markAsRead: (tripId: string) => void;
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

import React, { useState, useEffect, useRef } from 'react';
import { Send, X, User } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { authService } from '../services/c.authService';
import { tripService } from '../services/c.trip.service';

interface Message {
  _id: string;
  senderId: {
    _id: string;
    name: string;
    avatarURL?: string;
  };
  content: string;
  timestamp: string;
}

interface ChatWindowProps {
  tripId: string;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ tripId, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const socket = useSocket(tripId);
  const currentUser = authService.getCurrentUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await tripService.getChatHistory(tripId);
        setMessages(history);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };
    loadHistory();
  }, [tripId]);

  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !newMessage.trim() || !currentUser) return;

    socket.emit('send_message', {
      tripId,
      senderId: currentUser.id,
      content: newMessage.trim(),
    });

    setNewMessage('');
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="bg-indigo-600 p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <User size={20} />
          </div>
          <div>
            <h3 className="font-bold">Trip Chat</h3>
            <p className="text-xs text-indigo-100">Live with travel buddies</p>
          </div>
        </div>
        <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition">
          <X size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Send size={24} className="text-slate-300" />
            </div>
            <p className="text-sm font-medium">No messages yet. Say hi to your fellow travelers!</p>
          </div>
        ) : (
          messages.map(msg => {
            const isOwn = msg.senderId._id === currentUser?.id;
            return (
              <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${isOwn ? 'order-1' : 'order-2'}`}>
                  <div
                    className={`p-3 rounded-2xl shadow-sm text-sm ${isOwn ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none'}`}
                  >
                    {!isOwn && (
                      <p className="text-[10px] font-black text-indigo-600 uppercase mb-1">
                        {msg.senderId.name}
                      </p>
                    )}
                    <p>{msg.content}</p>
                  </div>
                  <p
                    className={`text-[10px] text-slate-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 bg-white border-t border-slate-100 flex gap-2"
      >
        <input
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-100"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;

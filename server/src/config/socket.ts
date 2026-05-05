import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { MessageModel } from '../models/message.model';

let ioInstance: SocketIOServer;

export const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io is not initialized');
  }
  return ioInstance;
};

export const setupSocket = (httpServer: HTTPServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  ioInstance = io;

  io.on('connection', socket => {
    console.log('A user connected:', socket.id);

    // Join personal user room for global notifications
    const userId = socket.handshake.query.userId;
    if (userId && typeof userId === 'string') {
      socket.join(`user_${userId}`);
    }

    // Join admin room if role is admin
    const role = socket.handshake.query.role;
    if (role === 'admin') {
      socket.join('admin_room');
    }

    socket.on('join_trip', (tripId: string) => {
      socket.join(tripId);
      console.log(`User ${socket.id} joined trip: ${tripId}`);
    });

    socket.on(
      'send_message',
      async (data: {
        tripId: string;
        senderId: string;
        content: string;
        messageType?: 'text' | 'image';
        fileUrl?: string;
      }) => {
        try {
          const newMessage = await MessageModel.create({
            tripId: data.tripId,
            senderId: data.senderId,
            content: data.content,
            messageType: data.messageType || 'text',
            fileUrl: data.fileUrl,
          });

          const populatedMessage = await MessageModel.findById(newMessage._id).populate(
            'senderId',
            'name avatarURL'
          );

          io.to(data.tripId).emit('receive_message', populatedMessage);
        } catch (error) {
          console.error('Error sending message:', error);
        }
      }
    );

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  return io;
};

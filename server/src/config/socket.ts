import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { MessageModel } from '../models/message.model';

let ioInstance: SocketIOServer;

export const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io is not initialized');
  }
  return ioInstance;
};

export const setupSocket = (httpServer: HTTPServer) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://tripbuddy.shahad.online',
    'https://main.demjrwlxtsr38.amplifyapp.com',
    'http://localhost:5173'
  ].filter(Boolean).map(origin => origin!.replace(/\/$/, ''));

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  ioInstance = io;

  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
        role: string;
      };
      socket.data.user = decoded; // Store user info in socket data
      next();
    } catch (err) {
      console.error('Socket Auth Error:', err);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', socket => {
    const user = socket.data.user;
    console.log('A user connected:', socket.id, 'User:', user.id);

    // Join personal user room for global notifications
    if (user.id) {
      socket.join(`user_${user.id}`);
    }

    // Join admin room if role is admin
    if (user.role === 'admin') {
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
        content: string;
        messageType?: 'text' | 'image';
        fileUrl?: string;
      }) => {
        try {
          const newMessage = await MessageModel.create({
            tripId: data.tripId,
            senderId: user.id, // Use verified ID from token
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

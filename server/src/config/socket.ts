import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { MessageModel } from '../models/message.model';

export const setupSocket = (httpServer: HTTPServer) => {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true,
        }
    });

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('join_trip', (tripId: string) => {
            socket.join(tripId);
            console.log(`User ${socket.id} joined trip: ${tripId}`);
        });

        socket.on('send_message', async (data: { tripId: string, senderId: string, content: string }) => {
            try {
                const newMessage = await MessageModel.create({
                    tripId: data.tripId,
                    senderId: data.senderId,
                    content: data.content,
                });

                const populatedMessage = await MessageModel.findById(newMessage._id).populate('senderId', 'name avatarURL');

                io.to(data.tripId).emit('receive_message', populatedMessage);
            } catch (error) {
                console.error('Error sending message:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });

    return io;
};

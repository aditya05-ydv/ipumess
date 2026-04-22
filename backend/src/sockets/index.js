import { Server } from 'socket.io';
import { verifyAuthToken } from '../config/security.js';

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: '*',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE']
        }
    });
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on('joinHostel', ({ token }) => {
            try {
                const payload = verifyAuthToken(token);
                socket.join(payload.hostel);
                socket.emit('joinedHostel', { hostel: payload.hostel });
            } catch (error) {
                socket.emit('socketError', { message: 'Failed to join hostel room' });
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
    return io;
};
export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};
export const emitRatingUpdate = (data) => {
    if (io) {
        io.to(data.hostel).emit('ratingUpdated', data);
    }
};
export const emitPollUpdate = (data) => {
    if (io) {
        io.to(data.hostel).emit('pollUpdate', data);
    }
};

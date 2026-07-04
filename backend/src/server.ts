import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import env from './config/environment';
import { verifyToken } from './utils/jwt';
import logger from './utils/logger';

const server = http.createServer(app);

// Initialize Socket.io Server bound to the HTTP Server
const allowedOrigins = env.ALLOWED_ORIGINS.split(',')
  .map(o => o.trim())
  .filter(o => o !== '*' && o !== '');
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

// Expose the socket instance inside the express app so controllers can access it
app.set('io', io);

// Socket.io connection events handler
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  // 1. Staff/Owners Room Subscription
  socket.on('joinCafe', (data: { cafe_id: string; token?: string }) => {
    try {
      const { cafe_id, token } = data;
      if (!cafe_id) {
        logger.warn(`joinCafe failed: Missing cafe_id from socket ${socket.id}`);
        return;
      }

      // Verify token signature if provided
      if (token) {
        const decoded = verifyToken(token);
        // Cross-check: Owner's token must match target cafe_id
        if (decoded.role === 'owner' && decoded.cafeId !== cafe_id) {
          logger.warn(`joinCafe unauthorized: Cafe ID mismatch for owner token in socket ${socket.id}`);
          socket.emit('error', { message: 'Unauthorized cafe room access' });
          return;
        }
      }

      const roomName = `cafe-${cafe_id}`;
      socket.join(roomName);
      logger.info(`Socket ${socket.id} joined room: ${roomName}`);
      socket.emit('joined', { room: roomName });
    } catch (err: any) {
      logger.error(`Socket joinCafe error: ${err.message}`);
      socket.emit('error', { message: 'Failed to join cafe room' });
    }
  });

  // 2. Customers Room Subscription (Order state updates tracking)
  socket.on('joinTable', (data: { table_id: string }) => {
    const { table_id } = data;
    if (!table_id) {
      logger.warn(`joinTable failed: Missing table_id from socket ${socket.id}`);
      return;
    }

    const roomName = `table-${table_id}`;
    socket.join(roomName);
    logger.info(`Socket ${socket.id} joined room: ${roomName}`);
    socket.emit('joined', { room: roomName });
  });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

export { server, io };
export default server;

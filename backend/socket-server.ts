import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import express from 'express';

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Store active channels and their subscribers
const channelRooms: Map<string, Set<string>> = new Map();
const channelMessages: Map<string, any[]> = new Map();
const MAX_MESSAGE_HISTORY = 100;

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User joins a channel
  socket.on('join_channel', (data: { channelId: string }) => {
    const { channelId } = data;
    socket.join(channelId);

    // Initialize channel if not exists
    if (!channelRooms.has(channelId)) {
      channelRooms.set(channelId, new Set());
      channelMessages.set(channelId, []);
    }

    // Add user to channel
    channelRooms.get(channelId)?.add(socket.id);

    // Send chat history to the user
    const history = channelMessages.get(channelId) || [];
    socket.emit('chat_history', history);

    // Notify others that user joined
    io.to(channelId).emit('user_joined', {
      userId: socket.id,
      totalUsers: channelRooms.get(channelId)?.size || 0,
    });
  });

  // User sends a message
  socket.on('send_message', (data: any) => {
    const { channelId, user, message, timestamp, id } = data;

    const messageData = {
      id,
      user,
      message,
      timestamp,
    };

    // Store message in history
    const messages = channelMessages.get(channelId) || [];
    messages.push(messageData);

    // Keep only last 100 messages
    if (messages.length > MAX_MESSAGE_HISTORY) {
      messages.shift();
    }

    channelMessages.set(channelId, messages);

    // Broadcast message to all users in channel
    io.to(channelId).emit('chat_message', messageData);
  });

  // User leaves channel
  socket.on('leave_channel', (data: { channelId: string }) => {
    const { channelId } = data;
    socket.leave(channelId);

    const users = channelRooms.get(channelId);
    if (users) {
      users.delete(socket.id);
      io.to(channelId).emit('user_left', {
        userId: socket.id,
        totalUsers: users.size,
      });

      // Clean up empty channels
      if (users.size === 0) {
        channelRooms.delete(channelId);
        channelMessages.delete(channelId);
      }
    }
  });

  // User disconnects
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);

    // Remove user from all channels
    channelRooms.forEach((users, channelId) => {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        io.to(channelId).emit('user_left', {
          userId: socket.id,
          totalUsers: users.size,
        });

        // Clean up empty channels
        if (users.size === 0) {
          channelRooms.delete(channelId);
          channelMessages.delete(channelId);
        }
      }
    });
  });
});

// REST API endpoints
app.get('/api/channels', (req, res) => {
  const channels = Array.from(channelRooms.entries()).map(([id, users]) => ({
    id,
    name: `Channel ${id}`,
    status: users.size > 0 ? 'live' : 'offline',
    viewers: users.size,
  }));
  res.json(channels);
});

app.get('/api/stats', (req, res) => {
  let totalViewers = 0;
  let totalMessages = 0;

  channelRooms.forEach(users => {
    totalViewers += users.size;
  });

  channelMessages.forEach(messages => {
    totalMessages += messages.length;
  });

  res.json({
    totalViewers,
    activeStreams: channelRooms.size,
    totalMessages,
    uptime: process.uptime(),
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});

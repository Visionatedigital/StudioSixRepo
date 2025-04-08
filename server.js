const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize WebSocket server
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  const userColors = {};
  const colors = [
    '#FF5733', // Bright Red
    '#33FF57', // Bright Green
    '#3357FF', // Bright Blue
    '#FF33F5', // Bright Pink
    '#FFB733', // Bright Orange
    '#33FFE9', // Bright Cyan
    '#B733FF', // Bright Purple
    '#FF3366', // Bright Rose
  ];

  let colorIndex = 0;

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-project', ({ projectId, userId, userName }) => {
      // Assign a color to the user if they don't have one
      if (!userColors[userId]) {
        userColors[userId] = colors[colorIndex % colors.length];
        colorIndex++;
      }

      socket.join(projectId);
      
      // Store user data in socket
      socket.data.userId = userId;
      socket.data.userName = userName;
      socket.data.projectId = projectId;

      // Broadcast to others in the project that a new user joined
      socket.to(projectId).emit('user-joined', {
        userId,
        userName,
        color: userColors[userId]
      });

      // Send current users to the new joiner
      const projectSockets = io.sockets.adapter.rooms.get(projectId);
      if (projectSockets) {
        const connectedUsers = Array.from(projectSockets).map(socketId => {
          const socket = io.sockets.sockets.get(socketId);
          return {
            userId: socket?.data.userId,
            userName: socket?.data.userName,
            color: userColors[socket?.data.userId || '']
          };
        });
        socket.emit('current-users', connectedUsers);
      }
    });

    socket.on('cursor-move', ({ x, y, projectId }) => {
      socket.to(projectId).emit('cursor-update', {
        userId: socket.data.userId,
        userName: socket.data.userName,
        color: userColors[socket.data.userId],
        x,
        y
      });
    });

    socket.on('canvas-update', (data) => {
      socket.to(data.projectId).emit('canvas-updated', data);
    });

    socket.on('disconnect', () => {
      if (socket.data.projectId) {
        socket.to(socket.data.projectId).emit('user-left', {
          userId: socket.data.userId,
          userName: socket.data.userName
        });
      }
      console.log('Client disconnected:', socket.id);
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}); 
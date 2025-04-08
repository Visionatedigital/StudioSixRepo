import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Socket } from 'socket.io';

interface UserData {
  userId: string;
  userName: string;
  projectId: string;
}

interface JoinProjectData {
  projectId: string;
  userId: string;
  userName: string;
}

interface CursorMoveData {
  x: number;
  y: number;
  projectId: string;
}

interface CanvasUpdateData {
  projectId: string;
  type: string;
  data: any;
}

export const initWebSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  const userColors: { [key: string]: string } = {};
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

  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-project', ({ projectId, userId, userName }: JoinProjectData) => {
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

    socket.on('cursor-move', ({ x, y, projectId }: CursorMoveData) => {
      socket.to(projectId).emit('cursor-update', {
        userId: socket.data.userId,
        userName: socket.data.userName,
        color: userColors[socket.data.userId],
        x,
        y
      });
    });

    socket.on('canvas-update', (data: CanvasUpdateData) => {
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

  return io;
}; 
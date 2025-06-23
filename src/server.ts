import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import https from 'https';
import http from 'http';
import fs from 'fs';
import { app } from './app';
import { Server } from 'socket.io';


const PORT = process.env.PORT || 3000;

// const options = {
//   key: fs.readFileSync('./server.key'), // Replace with your private key path
//   cert: fs.readFileSync('./server.cert'), // Replace with your certificate path
// };

const server = http.createServer(app);
// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://webauthn.ritikmitra.me',
      'http://localhost:3000',
    ],
    // origin : "*",
    credentials: true
  }
});

// Socket event handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user room (1:1 or group)
  socket.on('join', (userId) => {
    socket.join(userId); // each user has their own room
    console.log(`User ${userId} joined their room`);
  });

  // Send message to another user
  socket.on('send-message', ({ to, message, from }) => {
    console.log(`Message from ${from} to ${to}:`, message);
    io.to(to).emit('receive-message', { from, message });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running with HTTPS on port ${PORT}`);
});
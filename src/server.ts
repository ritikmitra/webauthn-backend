import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import https from 'https';
import http from 'http';
import fs from 'fs';
import { app } from './app';
import { Server } from 'socket.io';
import { getUserDeviceTokens } from './services/profile.services';
import { AppError } from './errors/AppError';
import { sendNotificationMultipleDevices, sendNotificationSingleDevice } from './services/notification.services';


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
  });

  // Send message to another user
  socket.on('send-message', async ({ to, message, from }) => {
    const clients = await io.in(to).fetchSockets()
    const isUserOnline = clients.length > 0;
    if (isUserOnline) {
      io.to(to).emit('receive-message', { from, message });
    } else {
      const token = await getUserDeviceTokens(to)
      if (!token || token.length === 0) {
        throw new AppError('No device tokens found for the user', 404);
      }
      // Extract device tokens from the token array
      const deviceTokens = token.map(t => t.deviceToken);
      if (deviceTokens.length > 1) {
        // If there are multiple device tokens, send notification to all
        const response = await sendNotificationMultipleDevices(deviceTokens, from, message);
        return response;

      } else {
        // If there is only one device token, send notification to that single device
        const response = await sendNotificationSingleDevice(deviceTokens[0], from, message);
        return response;
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running with HTTPS on port ${PORT}`);
});
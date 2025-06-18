import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middlewares/errorHandler';
import { profileRouter } from './routes/profile.routes';

export const app = express();

const allowedOrigins = [
    'https://localhost:5000',
    'http://localhost:5173',
    'https://webauthn.ritikmitra.me'
  ];

app.use(cors({
    origin: allowedOrigins,  // specify the frontend URL', // Allow all origins for development, restrict in production
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));
app.use(express.json());

// Routes
app.use('/', authRoutes);

app.use('/', profileRouter);

// Error Middleware
app.use(errorHandler);


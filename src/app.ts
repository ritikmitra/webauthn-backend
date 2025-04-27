import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import { errorHandler } from './middlewares/errorHandler';


export const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/', authRoutes);

// Error Middleware
app.use(errorHandler);


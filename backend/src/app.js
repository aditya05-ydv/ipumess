import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import pollRoutes from './routes/pollRoutes.js';
import fastingRoutes from './routes/fastingRoutes.js';
import suggestionRoutes from './routes/suggestionRoutes.js'; // ADD

const app = express();

app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Smart Mess System API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/poll', pollRoutes);
app.use('/api/fasting', fastingRoutes);
app.use('/api/suggestions', suggestionRoutes); // ADD

export default app;
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import pollRoutes from './routes/pollRoutes.js';
// FASTING REGISTER FEATURE - import (remove this line to delete feature)
import fastingRoutes from './routes/fastingRoutes.js';


const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Smart Mess System API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/poll', pollRoutes);
// FASTING REGISTER FEATURE - route (remove this line to delete feature)
app.use('/api/fasting', fastingRoutes);

export default app;
import express from 'express';
import {
    submitRating,
    getHostelRatings,
    getItemRatings,
    getWeeklyGraphData,
    getWeeklyAverages,
    resetAllRatings,
    getMyRatings,
    getDayMealRatings,
     
} from '../controllers/ratingController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

// Admin reset — MUST come before generic routes
router.post('/admin/reset', requireRole('admin'), resetAllRatings);

router.post('/', submitRating);
router.get('/', getHostelRatings);
router.get('/item/:itemName', getItemRatings);
router.get('/weekly-graph', getWeeklyGraphData);
router.get('/weekly-averages', getWeeklyAverages);
router.get('/my-ratings', getMyRatings);
router.get('/day-meal-ratings', getDayMealRatings); // ← add this

export default router;
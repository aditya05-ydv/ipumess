import express from 'express';
import { submitSuggestion, getMessSuggestions } from '../controllers/suggestionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// User submits suggestion (must be logged in)
router.post('/submit', protect, submitSuggestion);

// Admin gets mess suggestions for their hostel
router.get('/mess/:hostel', protect, getMessSuggestions);

export default router;
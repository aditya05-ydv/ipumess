import express from 'express';
import {
    createPoll,
    getPolls,
    getCurrentPolls,
    voteInPoll,
    getPollResults,
    getExpiredPolls,
    deletePoll,
    resetPolls
} from '../controllers/pollController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

// Create poll — both users and admins
router.post('/', createPoll);

// Reset all admin polls for this hostel
router.post('/reset', requireRole('admin'), resetPolls);

// Delete a specific admin poll
router.delete('/:pollId', requireRole('admin'), deletePoll);

// Get all polls
router.get('/', getPolls);

// Get current active polls with remaining slots
router.get('/current', getCurrentPolls);

// Vote on a poll
router.post('/vote', voteInPoll);

// Get poll results (after 24h)
router.get('/results/:pollId', getPollResults);

// Get all expired polls
router.get('/expired', getExpiredPolls);

export default router;
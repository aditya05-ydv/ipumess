// change by antigracity — this file was accidentally overwritten with middleware code.
// Restored to correct menu routes with a default export.

import express from 'express';
import {
    getMyHostelWeeklyMenu,
    getMyHostelDayMenu,
    upsertMyHostelDayMenu,
    deleteMyHostelDayMenu,
} from '../controllers/menuController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get full weekly menu for a hostel (public - no auth required)
router.get('/:hostel', getMyHostelWeeklyMenu);

// Get a single day menu for a hostel (public - no auth required)
router.get('/:hostel/:day', getMyHostelDayMenu);

// Admin: upsert (create/update) a day menu
router.put('/:hostel/:day', requireAuth, requireRole('admin'), upsertMyHostelDayMenu);

// Admin: delete a day menu
router.delete('/:hostel/:day', requireAuth, requireRole('admin'), deleteMyHostelDayMenu);

export default router; // change by antigracity — added missing default export
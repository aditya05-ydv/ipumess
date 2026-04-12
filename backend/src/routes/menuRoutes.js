import express from 'express';
import {
	deleteMyHostelDayMenu,
	getMyHostelDayMenu,
	getMyHostelWeeklyMenu,
	upsertMyHostelDayMenu,
} from '../controllers/menuController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:hostel', getMyHostelWeeklyMenu);
router.get('/:hostel/:day', getMyHostelDayMenu);
router.put('/:hostel/:day', requireAuth, requireRole('admin'), upsertMyHostelDayMenu);
router.post('/:hostel/:day', requireAuth, requireRole('admin'), upsertMyHostelDayMenu);
router.delete('/:hostel/:day', requireAuth, requireRole('admin'), deleteMyHostelDayMenu);

export default router;

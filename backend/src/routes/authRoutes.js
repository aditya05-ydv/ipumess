import express from 'express';
import { adminLogin, login, changePassword, resetPassword } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/admin/login', adminLogin);
router.post('/change-password', changePassword);
router.post('/reset-password', requireAuth, resetPassword); // admin only

export default router;
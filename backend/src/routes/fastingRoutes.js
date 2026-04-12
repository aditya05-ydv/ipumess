// ============================================================
// FASTING REGISTER FEATURE - ROUTES
// To remove this feature: delete this entire file
// ============================================================

import express from 'express';
import {
    activateFasting,
    deactivateFasting,
    getFasting,
    submitFasting,
    editFasting,
    deleteFastingEntry,
} from '../controllers/fastingController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getFasting);                        // Get register status + entries
router.post('/activate', activateFasting);          // Admin: activate
router.post('/deactivate', deactivateFasting);      // Admin: deactivate
router.post('/submit', submitFasting);              // User: submit entry
router.put('/edit', editFasting);                   // User: edit own entry
router.delete('/entry', deleteFastingEntry);        // User: delete own entry

export default router;

// ============================================================
// END FASTING REGISTER FEATURE - ROUTES
// ============================================================
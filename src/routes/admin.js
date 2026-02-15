// src/routes/admin.js

import { Router } from 'express';
import { getAnalytics } from '../services/analytics.js';

const router = Router();

/**
 * GET /admin/analytics
 * Privacy-safe, aggregate-only insights
 */
router.get('/analytics', (_req, res) => {
  res.json({
    success: true,
    data: getAnalytics()
  });
});

export default router;

import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/summary', AnalyticsController.getSummary);
router.get('/upi', AnalyticsController.getUPIAnalysis);
router.get('/trends', AnalyticsController.getTrends);

export default router;

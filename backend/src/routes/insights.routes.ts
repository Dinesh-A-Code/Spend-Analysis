import { Router } from 'express';
import { InsightsController } from '../controllers/insights.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', InsightsController.getInsights);
router.post('/recalculate', InsightsController.recalculateInsights);
router.post('/:id/dismiss', InsightsController.dismissInsight);

export default router;

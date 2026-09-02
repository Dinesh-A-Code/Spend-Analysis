import { type Response } from 'express';
import { type AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { InsightsEngineService } from '../services/insights_engine.service.js';

export class InsightsController {
  public static async getInsights(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const insights = await InsightsEngineService.getInsights(userId);

      res.status(200).json({
        success: true,
        data: { insights }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve AI insights.'
      });
    }
  }

  public static async dismissInsight(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const id = Number(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Valid insight ID is required.'
        });
        return;
      }

      const dismissed = await InsightsEngineService.dismissInsight(userId, id);
      if (!dismissed) {
        res.status(404).json({
          success: false,
          error: 'Insight not found or already dismissed.'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { message: 'Insight dismissed successfully.' }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to dismiss insight.'
      });
    }
  }

  public static async recalculateInsights(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const anchorDate = (req.body.date as string) || '2026-08-31';

      const freshInsights = await InsightsEngineService.recalculateInsights(userId, anchorDate);

      res.status(200).json({
        success: true,
        data: {
          insights: freshInsights,
          message: 'AI spending insights recalculated from verified transaction dataset.'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to recalculate AI insights.'
      });
    }
  }
}

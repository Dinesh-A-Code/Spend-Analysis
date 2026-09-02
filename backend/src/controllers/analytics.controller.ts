import { type Response } from 'express';
import { type AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { AnalyticsService } from '../services/analytics.service.js';
import { type Period } from '../types/index.js';

export class AnalyticsController {
  public static async getSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const period = (req.query.period as Period) || 'monthly';
      const anchorDate = (req.query.date as string) || '2026-08-31';

      const summary = await AnalyticsService.getSummary(userId, period, anchorDate);

      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate analytics summary.'
      });
    }
  }

  public static async getUPIAnalysis(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const period = (req.query.period as Period) || 'daily';
      const anchorDate = (req.query.date as string) || '2026-08-31';

      const analysis = await AnalyticsService.getUPIAnalysis(userId, period, anchorDate);

      res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate UPI spending analysis.'
      });
    }
  }

  public static async getTrends(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const trends = await AnalyticsService.getMonthlyTrends(userId);

      res.status(200).json({
        success: true,
        data: { trends }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve spending trends.'
      });
    }
  }
}

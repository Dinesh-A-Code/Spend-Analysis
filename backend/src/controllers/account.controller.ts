import { type Response } from 'express';
import { type AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { AccountService } from '../services/account.service.js';
import { AAProviderRegistry } from '../services/aa/registry.js';
import { type AAProviderType } from '../services/aa/types.js';

export class AccountController {
  public static async getAccounts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const accounts = await AccountService.getAccounts(userId);

      res.status(200).json({
        success: true,
        data: { accounts }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve connected accounts.'
      });
    }
  }

  public static async getProviders(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const providers = AAProviderRegistry.listSupportedProviders();
      res.status(200).json({
        success: true,
        data: { providers }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve supported AA providers.'
      });
    }
  }

  public static async connect(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { institution_name, provider } = req.body;

      if (!institution_name || typeof institution_name !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Institution name is required.'
        });
        return;
      }

      const connectedAccount = await AccountService.connectAccount(
        userId,
        institution_name,
        provider as AAProviderType | undefined
      );

      res.status(201).json({
        success: true,
        data: {
          account: connectedAccount,
          message: 'Connected account created successfully and authorized financial data synchronized.'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect financial institution.'
      });
    }
  }

  public static async connectMock(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { institution_name } = req.body;

      if (!institution_name || typeof institution_name !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Institution name is required.'
        });
        return;
      }

      const connectedAccount = await AccountService.connectMockAccount(userId, institution_name);

      res.status(201).json({
        success: true,
        data: {
          account: connectedAccount,
          message: 'Connected account created successfully and sandbox transactions ingested.'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect financial institution.'
      });
    }
  }

  public static async syncAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const accountId = Number(req.params.id);

      if (isNaN(accountId)) {
        res.status(400).json({
          success: false,
          error: 'Valid account ID is required.'
        });
        return;
      }

      const result = await AccountService.syncAccountData(userId, accountId);

      res.status(200).json({
        success: true,
        data: {
          ...result,
          message: `Account synchronized successfully: ${result.insertedCount} new transaction(s) ingested, ${result.skippedDuplicates} duplicate(s) skipped.`
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to synchronize account.'
      });
    }
  }

  public static async revokeConsent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const accountId = Number(req.params.id);

      if (isNaN(accountId)) {
        res.status(400).json({
          success: false,
          error: 'Valid account ID is required.'
        });
        return;
      }

      const updated = await AccountService.revokeConsent(userId, accountId);

      res.status(200).json({
        success: true,
        data: {
          account: updated,
          message: 'Account consent has been revoked successfully. Future synchronization is disabled.'
        }
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to revoke consent.'
      });
    }
  }

  public static async deleteFinancialData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await AccountService.deleteFinancialData(userId);

      res.status(200).json({
        success: true,
        data: {
          ...result,
          message: 'All Spend Analysis financial transaction and account records have been permanently cleared for your profile.'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete financial data.'
      });
    }
  }
}

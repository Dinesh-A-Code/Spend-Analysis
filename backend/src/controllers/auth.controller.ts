import { type Response } from 'express';
import { type AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { AuthService } from '../services/auth.service.js';

export class AuthController {
  public static async signup(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name, email, password, monthly_income, savings_target } = req.body;
      const result = await AuthService.signup({
        name,
        email,
        password,
        monthly_income,
        savings_target
      });

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Signup failed.'
      });
    }
  }

  public static async login(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid credentials.'
      });
    }
  }

  public static logout(req: AuthenticatedRequest, res: Response): void {
    res.status(200).json({
      success: true,
      data: { message: 'Logged out successfully.' }
    });
  }

  public static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const user = await AuthService.getUserProfile(userId);

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error instanceof Error ? error.message : 'User profile not found.'
      });
    }
  }

  public static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { name, monthly_income, savings_target } = req.body;
      const updated = await AuthService.updateUserProfile(userId, { name, monthly_income, savings_target });

      res.status(200).json({
        success: true,
        data: { user: updated }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Profile update failed.'
      });
    }
  }
}

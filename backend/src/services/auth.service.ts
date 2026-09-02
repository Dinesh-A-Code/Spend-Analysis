import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/database.js';
import {
  type User,
  type UserProfileResponse,
  type AuthTokenPayload
} from '../types/index.js';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') {
    if (!secret || secret.trim().length < 32) {
      throw new Error('[Fatal Security Error]: In production mode, JWT_SECRET must be explicitly provided in environment variables with at least 32 characters.');
    }
    return secret;
  }
  // Development / Test fallback
  return secret || 'spend_analysis_dev_jwt_secret_not_for_production_2026';
}

const JWT_EXPIRES_IN = '7d';

export class AuthService {
  public static generateToken(payload: AuthTokenPayload): string {
    return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
  }

  public static async signup(data: {
    name: string;
    email: string;
    password: string;
    monthly_income?: number;
    savings_target?: number;
  }): Promise<{ user: UserProfileResponse; token: string }> {
    const email = data.email.trim().toLowerCase();
    const name = data.name.trim();

    if (!email || !email.includes('@')) {
      throw new Error('Please provide a valid email address.');
    }

    if (!data.password || data.password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    if (!name) {
      throw new Error('Name is required.');
    }

    // Check if user exists
    const existing = await db.queryOne<{ id: number }>('SELECT id FROM users WHERE email = $1', [email]);
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(data.password, salt);

    const monthlyIncome = data.monthly_income ?? 0;
    const savingsTarget = data.savings_target ?? 0;

    await db.query(`
      INSERT INTO users (email, password_hash, name, monthly_income, savings_target)
      VALUES ($1, $2, $3, $4, $5)
    `, [email, passwordHash, name, monthlyIncome, savingsTarget]);

    const newUser = await db.queryOne<UserProfileResponse>(`
      SELECT id, email, name, monthly_income, savings_target, created_at
      FROM users WHERE email = $1
    `, [email]);

    if (!newUser) {
      throw new Error('Failed to create user account.');
    }

    const token = this.generateToken({ userId: newUser.id, email: newUser.email });

    return { user: newUser, token };
  }

  public static async login(data: {
    email: string;
    password: string;
  }): Promise<{ user: UserProfileResponse; token: string }> {
    const email = data.email.trim().toLowerCase();

    if (!email || !data.password) {
      throw new Error('Email and password are required.');
    }

    const user = await db.queryOne<User>(`
      SELECT id, email, password_hash, name, monthly_income, savings_target, created_at, updated_at
      FROM users WHERE email = $1
    `, [email]);

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isMatch = bcrypt.compareSync(data.password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const token = this.generateToken({ userId: user.id, email: user.email });

    const userProfile: UserProfileResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      monthly_income: Number(user.monthly_income),
      savings_target: Number(user.savings_target),
      created_at: user.created_at
    };

    return { user: userProfile, token };
  }

  public static async getUserProfile(userId: number): Promise<UserProfileResponse> {
    const user = await db.queryOne<UserProfileResponse>(`
      SELECT id, email, name, monthly_income, savings_target, created_at
      FROM users WHERE id = $1
    `, [userId]);

    if (!user) {
      throw new Error('User not found.');
    }

    return {
      ...user,
      monthly_income: Number(user.monthly_income),
      savings_target: Number(user.savings_target),
    };
  }

  public static async updateUserProfile(userId: number, data: {
    name?: string;
    monthly_income?: number;
    savings_target?: number;
  }): Promise<UserProfileResponse> {
    const current = await this.getUserProfile(userId);

    const name = data.name !== undefined ? data.name.trim() : current.name;
    const monthlyIncome = data.monthly_income !== undefined ? Number(data.monthly_income) : current.monthly_income;
    const savingsTarget = data.savings_target !== undefined ? Number(data.savings_target) : current.savings_target;

    await db.query(`
      UPDATE users
      SET name = $1, monthly_income = $2, savings_target = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `, [name, monthlyIncome, savingsTarget, userId]);

    return this.getUserProfile(userId);
  }
}

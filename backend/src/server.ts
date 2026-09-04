import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db, initDatabase } from './db/database.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// CORS Configuration (Scoped to local dev, configured FRONTEND_URL, and Android Capacitor webview origins)
const allowedOrigins: (string | RegExp)[] = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost',
  'https://localhost',
  'capacitor://localhost'
];

if (FRONTEND_URL && !allowedOrigins.includes(FRONTEND_URL)) {
  allowedOrigins.push(FRONTEND_URL);
}

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Initialize DB schema on startup
initDatabase().catch(err => {
  console.error('[Database Init Error]:', err);
});

// Health check endpoint
app.get('/api/health', async (req: Request, res: Response): Promise<void> => {
  try {
    const userRow = await db.queryOne<{ count: number }>('SELECT COUNT(*) as count FROM users');
    const txRow = await db.queryOne<{ count: number }>('SELECT COUNT(*) as count FROM transactions');
    const accountRow = await db.queryOne<{ count: number }>('SELECT COUNT(*) as count FROM connected_accounts');

    const userCount = Number(userRow?.count ?? 0);
    const txCount = Number(txRow?.count ?? 0);
    const accountCount = Number(accountRow?.count ?? 0);

    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        engine: db.isPostgres() ? 'Supabase PostgreSQL' : 'SQLite (Fallback)',
        users: userCount,
        accounts: accountCount,
        transactions: txCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Database error'
    });
  }
});

// Mount domain routes
app.use('/api', apiRoutes);

// Centralized error handler
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    const engine = db.isPostgres() ? 'Supabase PostgreSQL' : 'SQLite';
    console.log(`[Spend Analysis Backend] Running on port ${PORT}`);
    console.log(`[Database] Connected to ${engine}`);
  });
}

export default app;

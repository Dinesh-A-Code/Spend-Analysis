import pg from 'pg';
import dotenv from 'dotenv';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

dotenv.config();

const { Pool, types } = pg;

// 1. Configure PostgreSQL Type Parsers
// 1700 = NUMERIC / DECIMAL -> Parse as JavaScript number
types.setTypeParser(1700, (val: string) => parseFloat(val));
// 20 = INT8 / BIGINT -> Parse as integer number
types.setTypeParser(20, (val: string) => parseInt(val, 10));
// 1082 = DATE -> Return raw YYYY-MM-DD string (prevents timezone drift)
types.setTypeParser(1082, (val: string) => val);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '../..');

// Ensure backend/.env is loaded even if executed from workspace root or other directories
const backendEnvPath = path.resolve(backendRoot, '.env');
if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
}

// Connection mode detection
const databaseUrl = process.env.DATABASE_URL;
const isPostgres = Boolean(databaseUrl && databaseUrl.trim().length > 0);

// Initialize PostgreSQL Pool if DATABASE_URL is available
let pool: pg.Pool | null = null;
if (isPostgres) {
  const isSupabase = databaseUrl!.includes('supabase.com') || databaseUrl!.includes('pooler.supabase.com');
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  pool.on('error', (err) => {
    console.error('[PostgreSQL Pool Error]: Unexpected client error', err.message);
  });
}

// Fallback SQLite instance for local offline verification / rollback baseline
const rawDbPath = process.env.DATABASE_PATH || './data/spend_analysis.db';
const resolvedSqlitePath = path.isAbsolute(rawDbPath)
  ? rawDbPath
  : path.resolve(backendRoot, rawDbPath);

let sqliteDb: DatabaseSync | null = null;
function getSqliteInstance(): DatabaseSync {
  if (!sqliteDb) {
    const dir = path.dirname(resolvedSqlitePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    sqliteDb = new DatabaseSync(resolvedSqlitePath);
    sqliteDb.exec('PRAGMA foreign_keys = ON;');
    sqliteDb.exec('PRAGMA journal_mode = WAL;');
  }
  return sqliteDb;
}

export interface DbQueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

/**
 * Executes a parameterized SQL query asynchronously against PostgreSQL (or fallback SQLite).
 */
export async function query<T extends pg.QueryResultRow = any>(text: string, params: any[] = []): Promise<DbQueryResult<T>> {
  if (pool) {
    // PostgreSQL execution
    const res = await pool.query<T>(text, params);
    return {
      rows: res.rows,
      rowCount: res.rowCount ?? res.rows.length,
    };
  }

  // SQLite fallback execution
  const db = getSqliteInstance();
  // Convert $1, $2... placeholders to ? and ILIKE to LIKE for SQLite compatibility
  const sqliteText = text
    .replace(/\$(\d+)/g, '?')
    .replace(/\bILIKE\b/gi, 'LIKE');
  const isSelect = /^\s*(SELECT|PRAGMA)/i.test(text);

  if (isSelect) {
    const rows = db.prepare(sqliteText).all(...params) as T[];
    return { rows, rowCount: rows.length };
  } else {
    // Handle INSERT ... RETURNING id in SQLite fallback if applicable
    const stmt = db.prepare(sqliteText.replace(/RETURNING\s+id/gi, ''));
    const info = stmt.run(...params);
    let rows: T[] = [];
    if (/RETURNING\s+id/i.test(text)) {
      const lastId = (db.prepare('SELECT last_insert_rowid() as id').get() as any)?.id;
      rows = [{ id: lastId } as unknown as T];
    }
    return { rows, rowCount: Number(info.changes) };
  }
}

/**
 * Helper to query a single row.
 */
export async function queryOne<T extends pg.QueryResultRow = any>(text: string, params: any[] = []): Promise<T | undefined> {
  const result = await query<T>(text, params);
  return result.rows[0];
}

/**
 * Helper to query multiple rows.
 */
export async function queryAll<T extends pg.QueryResultRow = any>(text: string, params: any[] = []): Promise<T[]> {
  const result = await query<T>(text, params);
  return result.rows;
}

/**
 * Initializes database schema if needed.
 */
export async function initDatabase(): Promise<void> {
  if (pool) {
    // In PostgreSQL / Supabase, schema is already created via Step 2B DDL.
    return;
  }

  // SQLite fallback DDL init
  const db = getSqliteInstance();
  const candidates = [
    path.join(__dirname, 'schema.sql'),
    path.join(backendRoot, 'src/db/schema.sql'),
    path.join(backendRoot, 'dist/db/schema.sql'),
    path.resolve(process.cwd(), 'src/db/schema.sql'),
    path.resolve(process.cwd(), 'backend/src/db/schema.sql')
  ];

  let schemaSql: string | null = null;
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      schemaSql = fs.readFileSync(candidate, 'utf-8');
      break;
    }
  }

  if (schemaSql) {
    try {
      db.exec(schemaSql);
    } catch {
      // Schema may already exist
    }
  }
}

export const db = {
  query,
  queryOne,
  queryAll,
  isPostgres: () => isPostgres,
  getPool: () => pool,
};

export default db;

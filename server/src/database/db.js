import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.ptkybunorwwbejtbxsda:.%2FTQ%25L%2BRq%3Fs94sv@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

// Helper to convert SQLite ? placeholders to PostgreSQL $1, $2...
export function convertSql(sql) {
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
}

// Universal query runner for Supabase PostgreSQL
export async function query(sql, params = []) {
  const pgSql = convertSql(sql);
  const res = await pool.query(pgSql, params);
  return res;
}

// Single row helper
export async function queryOne(sql, params = []) {
  const res = await query(sql, params);
  return res.rows[0] || null;
}

// Multi row helper
export async function queryAll(sql, params = []) {
  const res = await query(sql, params);
  return res.rows;
}

// Execute helper (INSERT, UPDATE, DELETE)
export async function execute(sql, params = []) {
  const res = await query(sql, params);
  return {
    rowCount: res.rowCount,
    rows: res.rows
  };
}

export const db = {
  query,
  queryOne,
  queryAll,
  execute,
  pool
};

export default {
  db,
  pool,
  query,
  queryOne,
  queryAll,
  execute,
  convertSql
};

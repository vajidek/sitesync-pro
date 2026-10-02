import dotenv from 'dotenv';
dotenv.config();

import { createPool } from '../src/db/index.ts';

async function main() {
  const pool = createPool();

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS login_history (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        username TEXT NOT NULL,
        user_email TEXT,
        login_date TEXT NOT NULL,
        login_time TEXT NOT NULL,
        logout_time TEXT,
        session_duration INTEGER,
        browser TEXT,
        device TEXT,
        ip_address TEXT,
        status TEXT NOT NULL,
        failure_reason TEXT,
        created_at TEXT NOT NULL
      );
    `);
    console.log('Created login_history table successfully!');
  } catch (err) {
    console.error('Failed to create login_history table:', err);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

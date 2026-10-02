import { createPool, db } from '../src/db';
import * as schema from '../src/db/schema';
import { isTable } from 'drizzle-orm';

async function checkAllMappedTables() {
  const pool = createPool();
  const client = await pool.connect();

  console.log('=== DRIZZLE TABLE MAPPING & LIVE DB RECORD COUNTS ===');
  const results: any[] = [];

  for (const [key, val] of Object.entries(schema)) {
    if (isTable(val)) {
      const dbTableName = (val as any)[Symbol.for('drizzle:Name')] || (val as any)._?.name;
      if (
        key.toLowerCase().includes('purchase') ||
        key.toLowerCase().includes('procure') ||
        key.toLowerCase().includes('goods') ||
        key.toLowerCase().includes('receipt') ||
        key.toLowerCase().includes('vendor') ||
        key.toLowerCase().includes('rfq') ||
        key.toLowerCase().includes('phase56') ||
        key.toLowerCase().includes('phase69')
      ) {
        try {
          const res = await client.query(`SELECT COUNT(*) FROM "${dbTableName}"`);
          results.push({ key, dbTableName, count: Number(res.rows[0].count), status: 'EXISTS' });
        } catch (e: any) {
          results.push({ key, dbTableName, count: -1, status: `ERROR: ${e.message}` });
        }
      }
    }
  }

  console.table(results);
  client.release();
  process.exit(0);
}

checkAllMappedTables();

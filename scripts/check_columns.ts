import { createPool } from '../src/db';

async function checkColumns() {
  const pool = createPool();
  const client = await pool.connect();
  try {
    for (const t of ['procurement_purchase_orders', 'purchase_orders', 'procurement_grns', 'goods_receipts']) {
      const res = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [t]);
      console.log(`\n=== COLUMNS FOR ${t} (${res.rows.length}) ===`);
      console.log(res.rows.map((r: any) => `${r.column_name} (${r.data_type})`).join(', '));
    }
  } catch (err: any) {
    console.error('Error:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

checkColumns();

import { createPool } from '../src/db';

async function inspectDbTables() {
  const pool = createPool();
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log("Total DB tables:", res.rows.length);
    const procTables = res.rows
      .map((r: any) => r.table_name)
      .filter((t: string) => 
        t.includes("purchase") || 
        t.includes("procure") || 
        t.includes("goods") || 
        t.includes("receipt") || 
        t.includes("rfq") || 
        t.includes("quotation") || 
        t.includes("vendor") || 
        t.includes("phase") ||
        t.includes("order")
      );
    console.log("DB procurement & phase tables count:", procTables.length);

    for (const t of procTables) {
      try {
        const countRes = await client.query(`SELECT COUNT(*) FROM "${t}"`);
        console.log(`- ${t}: ${countRes.rows[0].count} records`);
      } catch (err: any) {
        console.log(`- ${t}: error querying count (${err.message})`);
      }
    }
  } catch (err: any) {
    console.error("Error inspecting tables:", err);
  } finally {
    client.release();
    process.exit(0);
  }
}

inspectDbTables();

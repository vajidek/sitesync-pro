import { createPool } from '../src/db/index.js';

async function testInsert() {
  const pool = createPool();
  try {
    const query = `
      insert into "goods_receipts" ("id", "grn_number", "po_number", "vendor_id", "vendor_name", "warehouse_id", "warehouse_name", "delivery_note_no", "received_date", "received_by", "inspected_by", "qc_status", "total_value", "status", "notes", "is_active", "created_at", "updated_at", "deleted_at", "created_by", "updated_by") 
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, default, default, default)
      RETURNING *;
    `;
    const params = [
      'grn-test-01', 'GRN-2026-TEST1', 'PO-2026-089', '', 'Emirates Steel Industries PJSC',
      'wh-001', 'Abu Dhabi Central Yard Warehouse', '', '2026-08-10', 'Ramesh Patel',
      'QC Inspector', 'PASSED', 38000, 'COMPLETED', '', true,
      '2026-08-10T10:12:58.148Z', '2026-08-10T10:12:58.148Z'
    ];
    const res = await pool.query(query, params);
    console.log('Insert success:', res.rows[0]);
  } catch (err) {
    console.error('Insert error:', err);
  } finally {
    await pool.end();
  }
}

testInsert();

import { createPool } from '../src/db';

async function checkProcurementTables() {
  const pool = createPool();
  const client = await pool.connect();
  try {
    const tables = [
      'purchase_orders',
      'purchase_order_items',
      'procurement_purchase_orders',
      'goods_receipts',
      'goods_receipt_items',
      'procurement_grns',
      'purchase_requests',
      'purchase_requisitions',
      'purchase_requisition_items',
      'procurement_requisitions',
      'request_for_quotations',
      'rfq_items',
      'rfq_vendors',
      'procurement_rfqs',
      'vendor_quotations',
      'vendor_quotation_items',
      'procurement_quotations',
      'vendors',
      'procurement_vendors',
      'phase69_purchase_orders',
      'phase69_goods_receipts',
      'phase69_purchase_requisitions',
      'phase69_rfq',
      'phase69_vendor_quotations',
      'phase69_vendor_master',
    ];

    console.log('=== PROCUREMENT DB TABLES & RECORD COUNTS ===');
    for (const t of tables) {
      try {
        const countRes = await client.query(`SELECT COUNT(*) FROM "${t}"`);
        console.log(`${t}: ${countRes.rows[0].count} records`);
      } catch (err: any) {
        console.log(`${t}: DOES NOT EXIST OR ERROR (${err.message})`);
      }
    }

    // Inspect the 1 legacy purchase order
    console.log('\n=== LEGACY purchase_orders SAMPLE ===');
    try {
      const legPo = await client.query(`SELECT * FROM "purchase_orders" LIMIT 5`);
      console.log(JSON.stringify(legPo.rows, null, 2));
    } catch (e: any) {
      console.log('Error reading purchase_orders:', e.message);
    }

    console.log('\n=== ACTIVE procurement_purchase_orders SAMPLE ===');
    try {
      const actPo = await client.query(`SELECT id, po_number, project_name, vendor_name, net_amount_usd, status, created_at FROM "procurement_purchase_orders" ORDER BY created_at DESC LIMIT 5`);
      console.log(JSON.stringify(actPo.rows, null, 2));
    } catch (e: any) {
      console.log('Error reading procurement_purchase_orders:', e.message);
    }

    console.log('\n=== ACTIVE procurement_grns SAMPLE ===');
    try {
      const actGrn = await client.query(`SELECT id, grn_number, po_number, vendor_name, warehouse_name, status, created_at FROM "procurement_grns" ORDER BY created_at DESC LIMIT 5`);
      console.log(JSON.stringify(actGrn.rows, null, 2));
    } catch (e: any) {
      console.log('Error reading procurement_grns:', e.message);
    }

    console.log('\n=== LEGACY goods_receipts SAMPLE ===');
    try {
      const legGrn = await client.query(`SELECT * FROM "goods_receipts" LIMIT 5`);
      console.log(JSON.stringify(legGrn.rows, null, 2));
    } catch (e: any) {
      console.log('Error reading goods_receipts:', e.message);
    }

  } catch (err: any) {
    console.error('Error:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

checkProcurementTables();

import { createPool } from '../src/db';

async function dataParityCheck() {
  const pool = createPool();
  const client = await pool.connect();
  try {
    console.log('============================================================');
    console.log('PART 5 — DATA PARITY COMPARISON CHECK');
    console.log('============================================================');

    // 1. Purchase Orders Parity
    const legPoRes = await client.query('SELECT * FROM "purchase_orders"');
    const actPoRes = await client.query('SELECT * FROM "procurement_purchase_orders"');
    const p56PoRes = await client.query('SELECT * FROM "phase56_purchase_orders"');

    console.log(`\n1. PURCHASE ORDERS:`);
    console.log(`- Legacy "purchase_orders" count: ${legPoRes.rows.length}`);
    console.log(`- Legacy "phase56_purchase_orders" count: ${p56PoRes.rows.length}`);
    console.log(`- Active "procurement_purchase_orders" count: ${actPoRes.rows.length}`);

    console.log('\nLegacy POs details:');
    for (const r of legPoRes.rows) {
      console.log(`  [Legacy PO] id: ${r.id}, po_number: ${r.po_number}, vendor: ${r.vendor_name}, total: ${r.total_amount}, status: ${r.status}`);
    }

    console.log('\nSample Active POs details (first 5):');
    for (const r of actPoRes.rows.slice(0, 5)) {
      console.log(`  [Active PO] id: ${r.id}, po_number: ${r.po_number}, vendor: ${r.vendor_name}, net_amount: ${r.net_amount_usd}, status: ${r.status}`);
    }

    // 2. Goods Receipts Parity
    const legGrnRes = await client.query('SELECT * FROM "goods_receipts"');
    const actGrnRes = await client.query('SELECT * FROM "procurement_grns"');

    console.log(`\n2. GOODS RECEIPTS:`);
    console.log(`- Legacy/Inventory "goods_receipts" count: ${legGrnRes.rows.length}`);
    console.log(`- Active "procurement_grns" count: ${actGrnRes.rows.length}`);

    console.log('\nSample Legacy GRNs details (first 3):');
    for (const r of legGrnRes.rows.slice(0, 3)) {
      console.log(`  [Legacy GRN] id: ${r.id}, grn_number: ${r.grn_number}, po_number: ${r.po_number}, warehouse: ${r.warehouse_name}, val: ${r.total_value}`);
    }

    console.log('\nSample Active GRNs details (first 3):');
    for (const r of actGrnRes.rows.slice(0, 3)) {
      console.log(`  [Active GRN] id: ${r.id}, grn_number: ${r.grn_number}, po_number: ${r.po_number}, warehouse: ${r.warehouse_name}`);
    }

    // 3. Purchase Requisitions Parity
    const legPrRes = await client.query('SELECT * FROM "purchase_requisitions"');
    const actPrRes = await client.query('SELECT * FROM "procurement_requisitions"');
    const p69PrRes = await client.query('SELECT * FROM "phase69_purchase_requisitions"');

    console.log(`\n3. PURCHASE REQUISITIONS:`);
    console.log(`- Legacy "purchase_requisitions" count: ${legPrRes.rows.length}`);
    console.log(`- Phase69 "phase69_purchase_requisitions" count: ${p69PrRes.rows.length}`);
    console.log(`- Active "procurement_requisitions" count: ${actPrRes.rows.length}`);

    // 4. Vendors Parity
    const legVndRes = await client.query('SELECT * FROM "vendors"');
    const actVndRes = await client.query('SELECT * FROM "procurement_vendors"');
    const p69VndRes = await client.query('SELECT * FROM "phase69_vendor_master"');

    console.log(`\n4. VENDORS:`);
    console.log(`- Legacy "vendors" count: ${legVndRes.rows.length}`);
    console.log(`- Phase69 "phase69_vendor_master" count: ${p69VndRes.rows.length}`);
    console.log(`- Active "procurement_vendors" count: ${actVndRes.rows.length}`);

  } catch (err: any) {
    console.error('Data parity check error:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

dataParityCheck();

import { createPool } from '../src/db/index.js';

async function createTables() {
  const pool = createPool();
  console.log('Creating Phase 55 PostgreSQL tables if not exists...');

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS material_categories (
        id VARCHAR(64) PRIMARY KEY,
        code VARCHAR(64) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS material_subcategories (
        id VARCHAR(64) PRIMARY KEY,
        code VARCHAR(64) NOT NULL,
        name VARCHAR(255) NOT NULL,
        category_id VARCHAR(64) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS warehouse_locations (
        id VARCHAR(64) PRIMARY KEY,
        code VARCHAR(64) NOT NULL,
        name VARCHAR(255) NOT NULL,
        warehouse_id VARCHAR(64) NOT NULL,
        zone VARCHAR(64),
        rack VARCHAR(64),
        shelf VARCHAR(64),
        bin VARCHAR(64),
        capacity NUMERIC(15, 2),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS goods_receipts (
        id VARCHAR(64) PRIMARY KEY,
        grn_number VARCHAR(64) NOT NULL UNIQUE,
        po_number VARCHAR(64),
        vendor_id VARCHAR(64),
        vendor_name VARCHAR(255),
        warehouse_id VARCHAR(64) NOT NULL,
        warehouse_name VARCHAR(255) NOT NULL,
        delivery_note_no VARCHAR(128),
        received_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        received_by VARCHAR(255) NOT NULL,
        inspected_by VARCHAR(255),
        qc_status VARCHAR(64) DEFAULT 'PASSED',
        total_value NUMERIC(15, 2) DEFAULT 0,
        status VARCHAR(64) DEFAULT 'RECEIVED',
        notes TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        deleted_at TIMESTAMP WITH TIME ZONE,
        created_by VARCHAR(64),
        updated_by VARCHAR(64)
      );

      CREATE TABLE IF NOT EXISTS goods_receipt_items (
        id VARCHAR(64) PRIMARY KEY,
        grn_id VARCHAR(64) NOT NULL,
        material_id VARCHAR(64) NOT NULL,
        material_code VARCHAR(64) NOT NULL,
        material_name VARCHAR(255) NOT NULL,
        ordered_qty NUMERIC(15, 2) DEFAULT 0,
        received_qty NUMERIC(15, 2) NOT NULL,
        accepted_qty NUMERIC(15, 2) NOT NULL,
        rejected_qty NUMERIC(15, 2) DEFAULT 0,
        unit_price NUMERIC(15, 2) DEFAULT 0,
        batch_number VARCHAR(64),
        expiry_date VARCHAR(64),
        location_id VARCHAR(64),
        remarks TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS material_issues (
        id VARCHAR(64) PRIMARY KEY,
        issue_number VARCHAR(64) NOT NULL UNIQUE,
        project_id VARCHAR(64),
        project_name VARCHAR(255),
        wbs_code VARCHAR(64),
        boq_ref VARCHAR(64),
        department VARCHAR(128),
        warehouse_id VARCHAR(64) NOT NULL,
        warehouse_name VARCHAR(255) NOT NULL,
        issued_to VARCHAR(255) NOT NULL,
        issued_by VARCHAR(255) NOT NULL,
        issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status VARCHAR(64) DEFAULT 'ISSUED',
        notes TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        deleted_at TIMESTAMP WITH TIME ZONE,
        created_by VARCHAR(64),
        updated_by VARCHAR(64)
      );

      CREATE TABLE IF NOT EXISTS material_issue_items (
        id VARCHAR(64) PRIMARY KEY,
        issue_id VARCHAR(64) NOT NULL,
        material_id VARCHAR(64) NOT NULL,
        material_code VARCHAR(64) NOT NULL,
        material_name VARCHAR(255) NOT NULL,
        requested_qty NUMERIC(15, 2) DEFAULT 0,
        issued_qty NUMERIC(15, 2) NOT NULL,
        unit_price NUMERIC(15, 2) DEFAULT 0,
        batch_number VARCHAR(64),
        location_id VARCHAR(64),
        remarks TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS material_transfers (
        id VARCHAR(64) PRIMARY KEY,
        transfer_number VARCHAR(64) NOT NULL UNIQUE,
        source_warehouse_id VARCHAR(64) NOT NULL,
        source_warehouse_name VARCHAR(255) NOT NULL,
        target_warehouse_id VARCHAR(64) NOT NULL,
        target_warehouse_name VARCHAR(255) NOT NULL,
        requested_by VARCHAR(255),
        approved_by VARCHAR(255),
        dispatched_by VARCHAR(255),
        received_by VARCHAR(255),
        transfer_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status VARCHAR(64) DEFAULT 'DISPATCHED',
        notes TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        deleted_at TIMESTAMP WITH TIME ZONE,
        created_by VARCHAR(64),
        updated_by VARCHAR(64)
      );

      CREATE TABLE IF NOT EXISTS material_transfer_items (
        id VARCHAR(64) PRIMARY KEY,
        transfer_id VARCHAR(64) NOT NULL,
        material_id VARCHAR(64) NOT NULL,
        material_code VARCHAR(64) NOT NULL,
        material_name VARCHAR(255) NOT NULL,
        transfer_qty NUMERIC(15, 2) NOT NULL,
        batch_number VARCHAR(64),
        remarks TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS material_returns (
        id VARCHAR(64) PRIMARY KEY,
        return_number VARCHAR(64) NOT NULL UNIQUE,
        return_type VARCHAR(64) DEFAULT 'SITE_RETURN',
        project_id VARCHAR(64),
        project_name VARCHAR(255),
        warehouse_id VARCHAR(64) NOT NULL,
        warehouse_name VARCHAR(255) NOT NULL,
        returned_by VARCHAR(255) NOT NULL,
        received_by VARCHAR(255) NOT NULL,
        return_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status VARCHAR(64) DEFAULT 'RECEIVED',
        reason TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        deleted_at TIMESTAMP WITH TIME ZONE,
        created_by VARCHAR(64),
        updated_by VARCHAR(64)
      );

      CREATE TABLE IF NOT EXISTS material_return_items (
        id VARCHAR(64) PRIMARY KEY,
        return_id VARCHAR(64) NOT NULL,
        material_id VARCHAR(64) NOT NULL,
        material_code VARCHAR(64) NOT NULL,
        material_name VARCHAR(255) NOT NULL,
        returned_qty NUMERIC(15, 2) NOT NULL,
        unit_price NUMERIC(15, 2) DEFAULT 0,
        batch_number VARCHAR(64),
        condition VARCHAR(64) DEFAULT 'GOOD',
        remarks TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS inventory_adjustments (
        id VARCHAR(64) PRIMARY KEY,
        adjustment_number VARCHAR(64) NOT NULL UNIQUE,
        warehouse_id VARCHAR(64) NOT NULL,
        warehouse_name VARCHAR(255) NOT NULL,
        material_id VARCHAR(64) NOT NULL,
        material_name VARCHAR(255) NOT NULL,
        material_code VARCHAR(64) NOT NULL,
        adjustment_type VARCHAR(64) NOT NULL,
        quantity NUMERIC(15, 2) NOT NULL,
        unit_price NUMERIC(15, 2) DEFAULT 0,
        reason TEXT NOT NULL,
        adjusted_by VARCHAR(255) NOT NULL,
        approved_by VARCHAR(255),
        status VARCHAR(64) DEFAULT 'APPROVED',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        deleted_at TIMESTAMP WITH TIME ZONE,
        created_by VARCHAR(64),
        updated_by VARCHAR(64)
      );

      CREATE TABLE IF NOT EXISTS inventory_logs (
        id VARCHAR(64) PRIMARY KEY,
        material_id VARCHAR(64),
        warehouse_id VARCHAR(64),
        action_type VARCHAR(64) NOT NULL,
        performed_by VARCHAR(255) NOT NULL,
        details TEXT NOT NULL,
        ip_address VARCHAR(64),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        deleted_at TIMESTAMP WITH TIME ZONE,
        created_by VARCHAR(64),
        updated_by VARCHAR(64)
      );
    `);

    const alterQueries = [
      `ALTER TABLE goods_receipts ALTER COLUMN total_value TYPE DOUBLE PRECISION`,
      `ALTER TABLE goods_receipts ALTER COLUMN received_date TYPE TEXT`,
      `ALTER TABLE goods_receipts ALTER COLUMN created_at TYPE TEXT`,
      `ALTER TABLE goods_receipts ALTER COLUMN updated_at TYPE TEXT`,
      `ALTER TABLE goods_receipts ALTER COLUMN deleted_at TYPE TEXT`,

      `ALTER TABLE goods_receipt_items ALTER COLUMN ordered_qty TYPE DOUBLE PRECISION`,
      `ALTER TABLE goods_receipt_items ALTER COLUMN received_qty TYPE DOUBLE PRECISION`,
      `ALTER TABLE goods_receipt_items ALTER COLUMN accepted_qty TYPE DOUBLE PRECISION`,
      `ALTER TABLE goods_receipt_items ALTER COLUMN rejected_qty TYPE DOUBLE PRECISION`,
      `ALTER TABLE goods_receipt_items ALTER COLUMN unit_price TYPE DOUBLE PRECISION`,
      `ALTER TABLE goods_receipt_items ALTER COLUMN expiry_date TYPE TEXT`,
      `ALTER TABLE goods_receipt_items ALTER COLUMN created_at TYPE TEXT`,

      `ALTER TABLE material_issues ALTER COLUMN issue_date TYPE TEXT`,
      `ALTER TABLE material_issues ALTER COLUMN created_at TYPE TEXT`,
      `ALTER TABLE material_issues ALTER COLUMN updated_at TYPE TEXT`,
      `ALTER TABLE material_issues ALTER COLUMN deleted_at TYPE TEXT`,

      `ALTER TABLE material_issue_items ALTER COLUMN requested_qty TYPE DOUBLE PRECISION`,
      `ALTER TABLE material_issue_items ALTER COLUMN issued_qty TYPE DOUBLE PRECISION`,
      `ALTER TABLE material_issue_items ALTER COLUMN unit_price TYPE DOUBLE PRECISION`,
      `ALTER TABLE material_issue_items ALTER COLUMN created_at TYPE TEXT`,

      `ALTER TABLE material_transfers ALTER COLUMN transfer_date TYPE TEXT`,
      `ALTER TABLE material_transfers ALTER COLUMN created_at TYPE TEXT`,
      `ALTER TABLE material_transfers ALTER COLUMN updated_at TYPE TEXT`,
      `ALTER TABLE material_transfers ALTER COLUMN deleted_at TYPE TEXT`,

      `ALTER TABLE material_transfer_items ALTER COLUMN transfer_qty TYPE DOUBLE PRECISION`,
      `ALTER TABLE material_transfer_items ALTER COLUMN created_at TYPE TEXT`,

      `ALTER TABLE material_returns ALTER COLUMN return_date TYPE TEXT`,
      `ALTER TABLE material_returns ALTER COLUMN created_at TYPE TEXT`,
      `ALTER TABLE material_returns ALTER COLUMN updated_at TYPE TEXT`,
      `ALTER TABLE material_returns ALTER COLUMN deleted_at TYPE TEXT`,

      `ALTER TABLE material_return_items ALTER COLUMN returned_qty TYPE DOUBLE PRECISION`,
      `ALTER TABLE material_return_items ALTER COLUMN unit_price TYPE DOUBLE PRECISION`,
      `ALTER TABLE material_return_items ALTER COLUMN created_at TYPE TEXT`,

      `ALTER TABLE inventory_adjustments ALTER COLUMN quantity TYPE DOUBLE PRECISION`,
      `ALTER TABLE inventory_adjustments ALTER COLUMN unit_price TYPE DOUBLE PRECISION`,
      `ALTER TABLE inventory_adjustments ALTER COLUMN created_at TYPE TEXT`,
      `ALTER TABLE inventory_adjustments ALTER COLUMN updated_at TYPE TEXT`,
      `ALTER TABLE inventory_adjustments ALTER COLUMN deleted_at TYPE TEXT`,

      `ALTER TABLE inventory_logs ALTER COLUMN created_at TYPE TEXT`,
      `ALTER TABLE inventory_logs ALTER COLUMN updated_at TYPE TEXT`,
      `ALTER TABLE inventory_logs ALTER COLUMN deleted_at TYPE TEXT`,

      `ALTER TABLE warehouse_locations ALTER COLUMN capacity TYPE DOUBLE PRECISION`,
      `ALTER TABLE warehouse_locations ALTER COLUMN created_at TYPE TEXT`,
      `ALTER TABLE warehouse_locations ALTER COLUMN updated_at TYPE TEXT`,

      `ALTER TABLE goods_receipt_items ADD COLUMN IF NOT EXISTS location_id VARCHAR(64)`,
      `ALTER TABLE goods_receipt_items ADD COLUMN IF NOT EXISTS remarks TEXT`,
      `ALTER TABLE material_issue_items ADD COLUMN IF NOT EXISTS location_id VARCHAR(64)`,
      `ALTER TABLE material_issue_items ADD COLUMN IF NOT EXISTS remarks TEXT`
    ];

    for (const q of alterQueries) {
      try {
        await pool.query(q);
      } catch (e: any) {
        // Ignore permission or already existing column errors
      }
    }

    console.log('✅ Phase 55 PostgreSQL tables created successfully!');
  } catch (err) {
    console.error('❌ Table creation error:', err);
  } finally {
    await pool.end();
  }
}

createTables();

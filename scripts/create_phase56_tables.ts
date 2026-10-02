import { createPool } from '../src/db/index.js';

async function createPhase56Tables() {
  const pool = createPool();
  console.log('Creating Phase 56 PostgreSQL procurement tables if not exists...');

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS purchase_requisitions (
        id VARCHAR(64) PRIMARY KEY,
        pr_number VARCHAR(64) NOT NULL UNIQUE,
        project_id VARCHAR(64),
        project_name VARCHAR(255),
        wbs_code VARCHAR(64),
        department VARCHAR(128),
        requested_by VARCHAR(255) NOT NULL,
        required_date TEXT,
        priority VARCHAR(32) DEFAULT 'MEDIUM',
        total_amount DOUBLE PRECISION DEFAULT 0,
        currency VARCHAR(16) DEFAULT 'AED',
        status VARCHAR(64) DEFAULT 'DRAFT',
        approval_step VARCHAR(128),
        current_approver VARCHAR(255),
        notes TEXT,
        is_active BOOLEAN DEFAULT true,
        is_deleted BOOLEAN DEFAULT false,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        created_by VARCHAR(64),
        updated_by VARCHAR(64)
      );

      CREATE TABLE IF NOT EXISTS purchase_requisition_items (
        id VARCHAR(64) PRIMARY KEY,
        pr_id VARCHAR(64) NOT NULL,
        material_id VARCHAR(64),
        material_code VARCHAR(64) NOT NULL,
        material_name VARCHAR(255) NOT NULL,
        quantity DOUBLE PRECISION NOT NULL,
        unit VARCHAR(32) DEFAULT 'PCS',
        estimated_unit_price DOUBLE PRECISION DEFAULT 0,
        estimated_total_price DOUBLE PRECISION DEFAULT 0,
        specification TEXT,
        required_date TEXT,
        boq_ref VARCHAR(64),
        remarks TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS request_for_quotations (
        id VARCHAR(64) PRIMARY KEY,
        rfq_number VARCHAR(64) NOT NULL UNIQUE,
        pr_id VARCHAR(64),
        pr_number VARCHAR(64),
        title VARCHAR(255) NOT NULL,
        project_id VARCHAR(64),
        project_name VARCHAR(255),
        issued_date TEXT NOT NULL,
        submission_deadline TEXT NOT NULL,
        issued_by VARCHAR(255) NOT NULL,
        status VARCHAR(64) DEFAULT 'ISSUED',
        terms_and_conditions TEXT,
        notes TEXT,
        is_active BOOLEAN DEFAULT true,
        is_deleted BOOLEAN DEFAULT false,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        created_by VARCHAR(64),
        updated_by VARCHAR(64)
      );

      CREATE TABLE IF NOT EXISTS rfq_items (
        id VARCHAR(64) PRIMARY KEY,
        rfq_id VARCHAR(64) NOT NULL,
        pr_item_id VARCHAR(64),
        material_id VARCHAR(64),
        material_code VARCHAR(64) NOT NULL,
        material_name VARCHAR(255) NOT NULL,
        quantity DOUBLE PRECISION NOT NULL,
        unit VARCHAR(32) DEFAULT 'PCS',
        specification TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS rfq_vendors (
        id VARCHAR(64) PRIMARY KEY,
        rfq_id VARCHAR(64) NOT NULL,
        vendor_id VARCHAR(64) NOT NULL,
        vendor_name VARCHAR(255) NOT NULL,
        vendor_email VARCHAR(255),
        status VARCHAR(64) DEFAULT 'INVITED',
        invited_at TEXT NOT NULL,
        responded_at TEXT
      );

      CREATE TABLE IF NOT EXISTS vendor_quotations (
        id VARCHAR(64) PRIMARY KEY,
        quotation_number VARCHAR(64) NOT NULL UNIQUE,
        rfq_id VARCHAR(64) NOT NULL,
        rfq_number VARCHAR(64) NOT NULL,
        vendor_id VARCHAR(64) NOT NULL,
        vendor_name VARCHAR(255) NOT NULL,
        quotation_date TEXT NOT NULL,
        valid_until TEXT,
        payment_terms VARCHAR(255),
        delivery_lead_time_days INTEGER DEFAULT 0,
        subtotal DOUBLE PRECISION DEFAULT 0,
        tax_amount DOUBLE PRECISION DEFAULT 0,
        discount_amount DOUBLE PRECISION DEFAULT 0,
        total_amount DOUBLE PRECISION DEFAULT 0,
        currency VARCHAR(16) DEFAULT 'AED',
        status VARCHAR(64) DEFAULT 'SUBMITTED',
        technical_score DOUBLE PRECISION DEFAULT 0,
        commercial_score DOUBLE PRECISION DEFAULT 0,
        overall_score DOUBLE PRECISION DEFAULT 0,
        notes TEXT,
        is_active BOOLEAN DEFAULT true,
        is_deleted BOOLEAN DEFAULT false,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        created_by VARCHAR(64),
        updated_by VARCHAR(64)
      );

      CREATE TABLE IF NOT EXISTS vendor_quotation_items (
        id VARCHAR(64) PRIMARY KEY,
        quotation_id VARCHAR(64) NOT NULL,
        rfq_item_id VARCHAR(64),
        material_id VARCHAR(64),
        material_code VARCHAR(64) NOT NULL,
        material_name VARCHAR(255) NOT NULL,
        offered_quantity DOUBLE PRECISION NOT NULL,
        unit_price DOUBLE PRECISION NOT NULL,
        total_price DOUBLE PRECISION NOT NULL,
        brand_model VARCHAR(255),
        country_of_origin VARCHAR(128),
        compliance_remarks TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS technical_evaluations (
        id VARCHAR(64) PRIMARY KEY,
        evaluation_number VARCHAR(64) NOT NULL UNIQUE,
        rfq_id VARCHAR(64) NOT NULL,
        quotation_id VARCHAR(64) NOT NULL,
        vendor_id VARCHAR(64) NOT NULL,
        vendor_name VARCHAR(255) NOT NULL,
        evaluator_id VARCHAR(64) NOT NULL,
        evaluator_name VARCHAR(255) NOT NULL,
        evaluation_date TEXT NOT NULL,
        specification_compliance_score DOUBLE PRECISION DEFAULT 0,
        quality_score DOUBLE PRECISION DEFAULT 0,
        delivery_lead_time_score DOUBLE PRECISION DEFAULT 0,
        overall_technical_score DOUBLE PRECISION DEFAULT 0,
        recommendation VARCHAR(64) DEFAULT 'QUALIFIED',
        remarks TEXT,
        is_active BOOLEAN DEFAULT true,
        is_deleted BOOLEAN DEFAULT false,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        created_by VARCHAR(64),
        updated_by VARCHAR(64)
      );

      CREATE TABLE IF NOT EXISTS commercial_evaluations (
        id VARCHAR(64) PRIMARY KEY,
        evaluation_number VARCHAR(64) NOT NULL UNIQUE,
        rfq_id VARCHAR(64) NOT NULL,
        quotation_id VARCHAR(64) NOT NULL,
        vendor_id VARCHAR(64) NOT NULL,
        vendor_name VARCHAR(255) NOT NULL,
        evaluator_id VARCHAR(64) NOT NULL,
        evaluator_name VARCHAR(255) NOT NULL,
        evaluation_date TEXT NOT NULL,
        unit_price_score DOUBLE PRECISION DEFAULT 0,
        payment_terms_score DOUBLE PRECISION DEFAULT 0,
        total_value_score DOUBLE PRECISION DEFAULT 0,
        overall_commercial_score DOUBLE PRECISION DEFAULT 0,
        recommendation VARCHAR(64) DEFAULT 'QUALIFIED',
        remarks TEXT,
        is_active BOOLEAN DEFAULT true,
        is_deleted BOOLEAN DEFAULT false,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        created_by VARCHAR(64),
        updated_by VARCHAR(64)
      );

      CREATE TABLE IF NOT EXISTS comparative_statements (
        id VARCHAR(64) PRIMARY KEY,
        statement_number VARCHAR(64) NOT NULL UNIQUE,
        rfq_id VARCHAR(64) NOT NULL,
        rfq_number VARCHAR(64) NOT NULL,
        project_id VARCHAR(64),
        project_name VARCHAR(255),
        prepared_by VARCHAR(255) NOT NULL,
        prepared_date TEXT NOT NULL,
        recommended_vendor_id VARCHAR(64),
        recommended_vendor_name VARCHAR(255),
        recommended_quotation_id VARCHAR(64),
        justification TEXT,
        status VARCHAR(64) DEFAULT 'DRAFT',
        approved_by VARCHAR(255),
        approved_at TEXT,
        is_active BOOLEAN DEFAULT true,
        is_deleted BOOLEAN DEFAULT false,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        created_by VARCHAR(64),
        updated_by VARCHAR(64)
      );

      CREATE TABLE IF NOT EXISTS purchase_orders (
        id VARCHAR(64) PRIMARY KEY,
        po_number VARCHAR(64) NOT NULL UNIQUE,
        pr_id VARCHAR(64),
        pr_number VARCHAR(64),
        rfq_id VARCHAR(64),
        quotation_id VARCHAR(64),
        vendor_id VARCHAR(64) NOT NULL,
        vendor_name VARCHAR(255) NOT NULL,
        project_id VARCHAR(64),
        project_name VARCHAR(255),
        warehouse_id VARCHAR(64),
        warehouse_name VARCHAR(255),
        po_date TEXT NOT NULL,
        expected_delivery_date TEXT,
        payment_terms VARCHAR(255),
        incoterms VARCHAR(128),
        currency VARCHAR(16) DEFAULT 'AED',
        subtotal DOUBLE PRECISION DEFAULT 0,
        tax_amount DOUBLE PRECISION DEFAULT 0,
        discount_amount DOUBLE PRECISION DEFAULT 0,
        total_amount DOUBLE PRECISION DEFAULT 0,
        revised_amount DOUBLE PRECISION DEFAULT 0,
        revision_count INTEGER DEFAULT 0,
        status VARCHAR(64) DEFAULT 'DRAFT',
        issued_by VARCHAR(255),
        approved_by VARCHAR(255),
        notes TEXT,
        is_active BOOLEAN DEFAULT true,
        is_deleted BOOLEAN DEFAULT false,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        created_by VARCHAR(64),
        updated_by VARCHAR(64)
      );

      CREATE TABLE IF NOT EXISTS purchase_order_items (
        id VARCHAR(64) PRIMARY KEY,
        po_id VARCHAR(64) NOT NULL,
        material_id VARCHAR(64),
        material_code VARCHAR(64) NOT NULL,
        material_name VARCHAR(255) NOT NULL,
        ordered_qty DOUBLE PRECISION NOT NULL,
        unit_price DOUBLE PRECISION NOT NULL,
        total_price DOUBLE PRECISION NOT NULL,
        received_qty DOUBLE PRECISION DEFAULT 0,
        outstanding_qty DOUBLE PRECISION NOT NULL,
        unit VARCHAR(32) DEFAULT 'PCS',
        specification TEXT,
        boq_ref VARCHAR(64),
        remarks TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS purchase_order_revisions (
        id VARCHAR(64) PRIMARY KEY,
        po_id VARCHAR(64) NOT NULL,
        revision_number INTEGER NOT NULL,
        revised_by VARCHAR(255) NOT NULL,
        revised_date TEXT NOT NULL,
        reason_for_revision TEXT NOT NULL,
        previous_total_amount DOUBLE PRECISION NOT NULL,
        new_total_amount DOUBLE PRECISION NOT NULL,
        changes_summary TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS purchase_order_approvals (
        id VARCHAR(64) PRIMARY KEY,
        po_id VARCHAR(64),
        pr_id VARCHAR(64),
        entity_type VARCHAR(32) NOT NULL,
        entity_number VARCHAR(64) NOT NULL,
        step INTEGER NOT NULL,
        approver_role VARCHAR(128) NOT NULL,
        approver_id VARCHAR(64),
        approver_name VARCHAR(255),
        status VARCHAR(64) DEFAULT 'PENDING',
        comments TEXT,
        action_date TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS delivery_schedules (
        id VARCHAR(64) PRIMARY KEY,
        po_id VARCHAR(64) NOT NULL,
        po_number VARCHAR(64) NOT NULL,
        po_item_id VARCHAR(64),
        material_name VARCHAR(255) NOT NULL,
        scheduled_date TEXT NOT NULL,
        scheduled_qty DOUBLE PRECISION NOT NULL,
        delivered_qty DOUBLE PRECISION DEFAULT 0,
        balance_qty DOUBLE PRECISION NOT NULL,
        status VARCHAR(64) DEFAULT 'SCHEDULED',
        destination_warehouse_id VARCHAR(64),
        destination_warehouse_name VARCHAR(255),
        carrier_name VARCHAR(255),
        tracking_number VARCHAR(128),
        remarks TEXT,
        is_active BOOLEAN DEFAULT true,
        is_deleted BOOLEAN DEFAULT false,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        created_by VARCHAR(64),
        updated_by VARCHAR(64)
      );

      CREATE TABLE IF NOT EXISTS vendor_performance (
        id VARCHAR(64) PRIMARY KEY,
        vendor_id VARCHAR(64) NOT NULL,
        vendor_name VARCHAR(255) NOT NULL,
        po_id VARCHAR(64),
        po_number VARCHAR(64),
        evaluation_period VARCHAR(128),
        quality_rating DOUBLE PRECISION DEFAULT 0,
        delivery_timeliness_rating DOUBLE PRECISION DEFAULT 0,
        commercial_competitiveness_rating DOUBLE PRECISION DEFAULT 0,
        overall_rating DOUBLE PRECISION DEFAULT 0,
        evaluator_name VARCHAR(255) NOT NULL,
        comments TEXT,
        is_active BOOLEAN DEFAULT true,
        is_deleted BOOLEAN DEFAULT false,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        created_by VARCHAR(64),
        updated_by VARCHAR(64)
      );

      CREATE TABLE IF NOT EXISTS procurement_logs (
        id VARCHAR(64) PRIMARY KEY,
        entity_type VARCHAR(64) NOT NULL,
        entity_id VARCHAR(64) NOT NULL,
        entity_number VARCHAR(64) NOT NULL,
        action_type VARCHAR(64) NOT NULL,
        performed_by VARCHAR(255) NOT NULL,
        details TEXT NOT NULL,
        ip_address VARCHAR(64),
        is_active BOOLEAN DEFAULT true,
        is_deleted BOOLEAN DEFAULT false,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        created_by VARCHAR(64),
        updated_by VARCHAR(64)
      );

      CREATE TABLE IF NOT EXISTS budget_allocations (
        id VARCHAR(64) PRIMARY KEY,
        project_id VARCHAR(64) NOT NULL,
        project_name VARCHAR(255) NOT NULL,
        cost_center_code VARCHAR(64) NOT NULL,
        allocated_amount DOUBLE PRECISION NOT NULL,
        committed_amount DOUBLE PRECISION DEFAULT 0,
        actual_spent_amount DOUBLE PRECISION DEFAULT 0,
        available_amount DOUBLE PRECISION NOT NULL,
        fiscal_year VARCHAR(32) NOT NULL,
        status VARCHAR(64) DEFAULT 'ACTIVE',
        is_active BOOLEAN DEFAULT true,
        is_deleted BOOLEAN DEFAULT false,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        created_by VARCHAR(64),
        updated_by VARCHAR(64)
      );

      CREATE TABLE IF NOT EXISTS procurement_comments (
        id VARCHAR(64) PRIMARY KEY,
        entity_type VARCHAR(64) NOT NULL,
        entity_id VARCHAR(64) NOT NULL,
        user_id VARCHAR(64) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        user_role VARCHAR(128),
        comment_text TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        is_deleted BOOLEAN DEFAULT false,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        created_by VARCHAR(64),
        updated_by VARCHAR(64)
      );

      CREATE TABLE IF NOT EXISTS procurement_documents (
        id VARCHAR(64) PRIMARY KEY,
        entity_type VARCHAR(64) NOT NULL,
        entity_id VARCHAR(64) NOT NULL,
        document_type VARCHAR(64) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_url TEXT NOT NULL,
        file_size INTEGER DEFAULT 0,
        uploaded_by VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        is_deleted BOOLEAN DEFAULT false,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        created_by VARCHAR(64),
        updated_by VARCHAR(64)
      );
    `);

    console.log('✅ Phase 56 PostgreSQL procurement tables created successfully!');
  } catch (err) {
    console.error('❌ Phase 56 Table creation error:', err);
  } finally {
    await pool.end();
  }
}

createPhase56Tables();

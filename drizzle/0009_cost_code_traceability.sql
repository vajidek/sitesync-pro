-- SiteSync Pro 0009: central cost-code and transaction traceability
CREATE TABLE IF NOT EXISTS cost_codes (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  project_id TEXT,
  wbs_id TEXT,
  parent_id TEXT,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  is_billable BOOLEAN NOT NULL DEFAULT TRUE,
  is_direct_cost BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_cost_codes_company_project_code
  ON cost_codes(company_id, COALESCE(project_id, ''), code);

CREATE INDEX IF NOT EXISTS idx_cost_codes_project_wbs
  ON cost_codes(project_id, wbs_id);

ALTER TABLE phase69_purchase_orders ADD COLUMN IF NOT EXISTS wbs_id TEXT;
ALTER TABLE phase69_purchase_orders ADD COLUMN IF NOT EXISTS boq_item_id TEXT;
ALTER TABLE phase69_purchase_orders ADD COLUMN IF NOT EXISTS cost_code_id TEXT;
ALTER TABLE phase69_purchase_orders ADD COLUMN IF NOT EXISTS cost_code TEXT;

ALTER TABLE phase69_po_items ADD COLUMN IF NOT EXISTS wbs_id TEXT;
ALTER TABLE phase69_po_items ADD COLUMN IF NOT EXISTS boq_item_id TEXT;
ALTER TABLE phase69_po_items ADD COLUMN IF NOT EXISTS cost_code_id TEXT;
ALTER TABLE phase69_po_items ADD COLUMN IF NOT EXISTS cost_code TEXT;

ALTER TABLE procurement_purchase_orders ADD COLUMN IF NOT EXISTS wbs_id TEXT;
ALTER TABLE procurement_purchase_orders ADD COLUMN IF NOT EXISTS boq_item_id TEXT;
ALTER TABLE procurement_purchase_orders ADD COLUMN IF NOT EXISTS cost_code_id TEXT;
ALTER TABLE procurement_purchase_orders ADD COLUMN IF NOT EXISTS cost_code TEXT;

ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS wbs_id TEXT;
ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS boq_item_id TEXT;
ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS cost_code_id TEXT;
ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS cost_code TEXT;

ALTER TABLE material_issue_items ADD COLUMN IF NOT EXISTS wbs_id TEXT;
ALTER TABLE material_issue_items ADD COLUMN IF NOT EXISTS boq_item_id TEXT;
ALTER TABLE material_issue_items ADD COLUMN IF NOT EXISTS cost_code_id TEXT;
ALTER TABLE material_issue_items ADD COLUMN IF NOT EXISTS cost_code TEXT;

ALTER TABLE material_issues ADD COLUMN IF NOT EXISTS wbs_id TEXT;
ALTER TABLE material_issues ADD COLUMN IF NOT EXISTS boq_item_id TEXT;
ALTER TABLE material_issues ADD COLUMN IF NOT EXISTS cost_code_id TEXT;
ALTER TABLE material_issues ADD COLUMN IF NOT EXISTS cost_code TEXT;

ALTER TABLE hr_labour_allocations ADD COLUMN IF NOT EXISTS wbs_id TEXT;
ALTER TABLE hr_labour_allocations ADD COLUMN IF NOT EXISTS boq_item_id TEXT;
ALTER TABLE hr_labour_allocations ADD COLUMN IF NOT EXISTS cost_code_id TEXT;
ALTER TABLE hr_labour_allocations ADD COLUMN IF NOT EXISTS cost_code TEXT;

ALTER TABLE fleet_fuel_logs ADD COLUMN IF NOT EXISTS wbs_id TEXT;
ALTER TABLE fleet_fuel_logs ADD COLUMN IF NOT EXISTS boq_item_id TEXT;
ALTER TABLE fleet_fuel_logs ADD COLUMN IF NOT EXISTS cost_code_id TEXT;
ALTER TABLE fleet_fuel_logs ADD COLUMN IF NOT EXISTS cost_code TEXT;

ALTER TABLE phase69_contracts ADD COLUMN IF NOT EXISTS wbs_id TEXT;
ALTER TABLE phase69_contracts ADD COLUMN IF NOT EXISTS cost_code_id TEXT;
ALTER TABLE phase69_contracts ADD COLUMN IF NOT EXISTS cost_code TEXT;

ALTER TABLE procurement_boq_items ADD COLUMN IF NOT EXISTS wbs_id TEXT;
ALTER TABLE procurement_boq_items ADD COLUMN IF NOT EXISTS cost_code_id TEXT;
ALTER TABLE procurement_boq_items ADD COLUMN IF NOT EXISTS cost_code TEXT;

-- SiteSync Pro BOQ/WBS procurement traceability
-- Item-level lineage: Project -> WBS -> BOQ -> PR Item -> RFQ Item -> PO Item -> GRN Item.

CREATE TABLE IF NOT EXISTS phase69_purchase_requisition_items (
  id TEXT PRIMARY KEY,
  pr_id TEXT NOT NULL,
  pr_number TEXT NOT NULL,
  item_number INTEGER NOT NULL,
  boq_item_id TEXT NOT NULL,
  wbs_id TEXT NOT NULL,
  boq_item_code TEXT NOT NULL,
  wbs_code TEXT NOT NULL,
  material_code TEXT NOT NULL,
  material_name TEXT NOT NULL,
  description TEXT NOT NULL,
  specification TEXT,
  quantity DOUBLE PRECISION NOT NULL,
  uom TEXT NOT NULL,
  estimated_unit_price DOUBLE PRECISION NOT NULL DEFAULT 0,
  estimated_total_price DOUBLE PRECISION NOT NULL DEFAULT 0,
  required_date TEXT,
  remarks TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  deleted_at TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_p69_pr_items_pr ON phase69_purchase_requisition_items(pr_id);
CREATE INDEX IF NOT EXISTS idx_p69_pr_items_boq ON phase69_purchase_requisition_items(boq_item_id);
CREATE INDEX IF NOT EXISTS idx_p69_pr_items_wbs ON phase69_purchase_requisition_items(wbs_id);

ALTER TABLE IF EXISTS phase69_rfq_items
  ADD COLUMN IF NOT EXISTS pr_item_id TEXT,
  ADD COLUMN IF NOT EXISTS boq_item_id TEXT,
  ADD COLUMN IF NOT EXISTS wbs_id TEXT,
  ADD COLUMN IF NOT EXISTS boq_item_code TEXT,
  ADD COLUMN IF NOT EXISTS wbs_code TEXT;

CREATE INDEX IF NOT EXISTS idx_p69_rfq_items_pr_item ON phase69_rfq_items(pr_item_id);
CREATE INDEX IF NOT EXISTS idx_p69_rfq_items_boq ON phase69_rfq_items(boq_item_id);
CREATE INDEX IF NOT EXISTS idx_p69_rfq_items_wbs ON phase69_rfq_items(wbs_id);

ALTER TABLE IF EXISTS phase69_po_items
  ADD COLUMN IF NOT EXISTS pr_item_id TEXT,
  ADD COLUMN IF NOT EXISTS rfq_item_id TEXT,
  ADD COLUMN IF NOT EXISTS boq_item_id TEXT,
  ADD COLUMN IF NOT EXISTS wbs_id TEXT,
  ADD COLUMN IF NOT EXISTS boq_item_code TEXT,
  ADD COLUMN IF NOT EXISTS wbs_code TEXT;

CREATE INDEX IF NOT EXISTS idx_p69_po_items_pr_item ON phase69_po_items(pr_item_id);
CREATE INDEX IF NOT EXISTS idx_p69_po_items_rfq_item ON phase69_po_items(rfq_item_id);
CREATE INDEX IF NOT EXISTS idx_p69_po_items_boq ON phase69_po_items(boq_item_id);
CREATE INDEX IF NOT EXISTS idx_p69_po_items_wbs ON phase69_po_items(wbs_id);

CREATE TABLE IF NOT EXISTS phase69_goods_receipt_items (
  id TEXT PRIMARY KEY,
  grn_id TEXT NOT NULL,
  grn_number TEXT NOT NULL,
  po_item_id TEXT NOT NULL,
  po_number TEXT NOT NULL,
  boq_item_id TEXT NOT NULL,
  wbs_id TEXT NOT NULL,
  boq_item_code TEXT NOT NULL,
  wbs_code TEXT NOT NULL,
  item_code TEXT NOT NULL,
  description TEXT NOT NULL,
  received_quantity DOUBLE PRECISION NOT NULL,
  accepted_quantity DOUBLE PRECISION NOT NULL DEFAULT 0,
  rejected_quantity DOUBLE PRECISION NOT NULL DEFAULT 0,
  uom TEXT NOT NULL,
  remarks TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  deleted_at TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_p69_grn_items_grn ON phase69_goods_receipt_items(grn_id);
CREATE INDEX IF NOT EXISTS idx_p69_grn_items_po_item ON phase69_goods_receipt_items(po_item_id);
CREATE INDEX IF NOT EXISTS idx_p69_grn_items_boq ON phase69_goods_receipt_items(boq_item_id);
CREATE INDEX IF NOT EXISTS idx_p69_grn_items_wbs ON phase69_goods_receipt_items(wbs_id);

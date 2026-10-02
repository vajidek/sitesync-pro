-- SiteSync Pro vendor quotation item lineage
CREATE TABLE IF NOT EXISTS phase69_vendor_quotation_items (
  id TEXT PRIMARY KEY,
  quotation_id TEXT NOT NULL,
  quotation_number TEXT NOT NULL,
  rfq_item_id TEXT NOT NULL,
  pr_item_id TEXT,
  boq_item_id TEXT NOT NULL,
  wbs_id TEXT NOT NULL,
  boq_item_code TEXT NOT NULL,
  wbs_code TEXT NOT NULL,
  item_code TEXT NOT NULL,
  description TEXT NOT NULL,
  quoted_quantity DOUBLE PRECISION NOT NULL,
  uom TEXT NOT NULL,
  quoted_unit_price DOUBLE PRECISION NOT NULL,
  line_subtotal DOUBLE PRECISION NOT NULL,
  line_vat_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  line_total DOUBLE PRECISION NOT NULL,
  delivery_lead_time_days INTEGER DEFAULT 0,
  remarks TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  deleted_at TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_p69_quote_items_quote ON phase69_vendor_quotation_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_p69_quote_items_rfq_item ON phase69_vendor_quotation_items(rfq_item_id);
CREATE INDEX IF NOT EXISTS idx_p69_quote_items_boq ON phase69_vendor_quotation_items(boq_item_id);
CREATE INDEX IF NOT EXISTS idx_p69_quote_items_wbs ON phase69_vendor_quotation_items(wbs_id);

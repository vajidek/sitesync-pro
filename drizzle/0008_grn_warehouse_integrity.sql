ALTER TABLE procurement_grns
  ADD COLUMN IF NOT EXISTS warehouse_id TEXT;

CREATE INDEX IF NOT EXISTS idx_procurement_grns_warehouse
  ON procurement_grns(warehouse_id);

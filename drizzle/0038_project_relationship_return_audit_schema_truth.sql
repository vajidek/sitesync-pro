-- SiteSync Pro 0038: project relationship, material return and audit schema truth

ALTER TABLE phase64_activity_relationships
  ADD COLUMN IF NOT EXISTS lag_days INTEGER NOT NULL DEFAULT 0;

ALTER TABLE material_returns
  ADD COLUMN IF NOT EXISTS project_id TEXT;

ALTER TABLE phase69_procurement_audit_logs
  ADD COLUMN IF NOT EXISTS entity_type TEXT;

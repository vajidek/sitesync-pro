-- SiteSync Pro 0039: cross-module integration schema truth
-- Explicit ALTERs are required because these legacy tables may have been created
-- by earlier migrations before the canonical ORM columns were introduced.

ALTER TABLE phase64_project_baselines
  ADD COLUMN IF NOT EXISTS project_id TEXT;

ALTER TABLE material_returns
  ADD COLUMN IF NOT EXISTS reason TEXT;

ALTER TABLE phase70_hr_audit_logs
  ADD COLUMN IF NOT EXISTS entity_type TEXT NOT NULL DEFAULT 'UNKNOWN';

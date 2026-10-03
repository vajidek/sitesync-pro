-- SiteSync Pro 0039: legacy project-controls / material-return / HR audit schema truth

ALTER TABLE phase64_project_baselines
  ADD COLUMN IF NOT EXISTS project_id TEXT;

ALTER TABLE material_returns
  ADD COLUMN IF NOT EXISTS reason TEXT;

ALTER TABLE phase70_hr_audit_logs
  ADD COLUMN IF NOT EXISTS entity_type TEXT;

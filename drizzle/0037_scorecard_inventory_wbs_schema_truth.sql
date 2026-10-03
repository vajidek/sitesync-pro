-- SiteSync Pro 0037: scorecard, inventory and WBS schema truth

ALTER TABLE phase69_supplier_scorecards
  ADD COLUMN IF NOT EXISTS quality_kpi_score DOUBLE PRECISION NOT NULL DEFAULT 92.0;

ALTER TABLE inventory_logs
  ADD COLUMN IF NOT EXISTS performed_by TEXT NOT NULL DEFAULT 'Inventory System';

ALTER TABLE phase64_work_packages
  ADD COLUMN IF NOT EXISTS created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP::text;

ALTER TABLE phase64_project_activities
  ADD COLUMN IF NOT EXISTS created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP::text;

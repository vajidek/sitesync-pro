-- SiteSync Pro 0036: material issue, project controls and guarantee schema truth

ALTER TABLE material_issues
  ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE phase64_work_packages
  ADD COLUMN IF NOT EXISTS wbs_id TEXT NOT NULL DEFAULT 'WBS-CI';

ALTER TABLE phase64_project_activities
  ADD COLUMN IF NOT EXISTS project_id TEXT NOT NULL DEFAULT 'PRJ-101';

ALTER TABLE phase69_bank_guarantees
  ADD COLUMN IF NOT EXISTS guarantee_amount_aed DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS custody_location TEXT;

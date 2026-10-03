-- SiteSync Pro QA/QC + HSE schema truth hardening
-- Existing data is preserved. Only future database defaults are corrected.
-- The baseline repair migration predates the current QA/QC model and omitted
-- three columns that are part of the canonical Drizzle schema. Add them here
-- so both fresh installs and upgrades converge on the same shape.
ALTER TABLE phase62_itp_masters
  ADD COLUMN IF NOT EXISTS project_id TEXT,
  ADD COLUMN IF NOT EXISTS prepared_by TEXT;

ALTER TABLE phase62_inspections
  ADD COLUMN IF NOT EXISTS project_id TEXT;


ALTER TABLE phase62_itp_masters
  ALTER COLUMN project_id DROP DEFAULT,
  ALTER COLUMN project_name DROP DEFAULT,
  ALTER COLUMN status SET DEFAULT 'DRAFT',
  ALTER COLUMN prepared_by DROP DEFAULT,
  ALTER COLUMN approved_by DROP NOT NULL,
  ALTER COLUMN created_by DROP DEFAULT,
  ALTER COLUMN updated_by DROP DEFAULT;

ALTER TABLE phase62_inspections
  ALTER COLUMN project_id DROP DEFAULT,
  ALTER COLUMN created_by DROP DEFAULT,
  ALTER COLUMN updated_by DROP DEFAULT;

ALTER TABLE phase62_ncr
  ALTER COLUMN project_id DROP DEFAULT,
  ALTER COLUMN created_by DROP DEFAULT,
  ALTER COLUMN updated_by DROP DEFAULT;

ALTER TABLE phase63_jsa
  ALTER COLUMN status SET DEFAULT 'DRAFT',
  ALTER COLUMN created_by DROP DEFAULT,
  ALTER COLUMN updated_by DROP DEFAULT;

ALTER TABLE phase63_work_permits
  ALTER COLUMN created_by DROP DEFAULT,
  ALTER COLUMN updated_by DROP DEFAULT;

ALTER TABLE phase63_safety_inspections
  ALTER COLUMN score_percentage SET DEFAULT 0,
  ALTER COLUMN status SET DEFAULT 'ACTION_REQUIRED',
  ALTER COLUMN created_by DROP DEFAULT,
  ALTER COLUMN updated_by DROP DEFAULT;

-- The ITP/JSA/PTW workflow code already prevents create-time approval.
-- These defaults now match that runtime policy at the database layer too.

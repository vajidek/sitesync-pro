-- SiteSync Pro 0040: HR loan and project resource schema truth

ALTER TABLE phase70_loans
  ADD COLUMN IF NOT EXISTS principal_amount_aed DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS approved_by TEXT;

ALTER TABLE phase64_resources
  ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'Unnamed Resource',
  ADD COLUMN IF NOT EXISTS unit_of_measure TEXT NOT NULL DEFAULT 'UNIT';

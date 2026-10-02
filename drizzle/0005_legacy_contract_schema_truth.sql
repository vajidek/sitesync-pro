-- SiteSync Pro legacy contract-table safety defaults
-- Existing rows are preserved; only future insert defaults are corrected.

ALTER TABLE phase69_contract_variations
  ALTER COLUMN status SET DEFAULT 'PROPOSED',
  ALTER COLUMN created_by DROP DEFAULT,
  ALTER COLUMN updated_by DROP DEFAULT;

ALTER TABLE phase69_contract_payments
  ALTER COLUMN payment_status SET DEFAULT 'CERTIFIED',
  ALTER COLUMN created_by DROP DEFAULT,
  ALTER COLUMN updated_by DROP DEFAULT;

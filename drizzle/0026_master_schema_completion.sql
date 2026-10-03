-- SiteSync Pro 0026: complete canonical master-table schema truth
-- Preserve historical rows while reconciling fields required by the ORM.

ALTER TABLE phase69_vendor_master
  ADD COLUMN IF NOT EXISTS category_code TEXT NOT NULL DEFAULT 'PIPES_FITTINGS',
  ADD COLUMN IF NOT EXISTS contact_person TEXT NOT NULL DEFAULT 'UNSPECIFIED',
  ADD COLUMN IF NOT EXISTS credit_terms_days INTEGER NOT NULL DEFAULT 60;

ALTER TABLE phase60_chart_of_accounts
  ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'UNSPECIFIED',
  ADD COLUMN IF NOT EXISTS parent_account_id TEXT;

ALTER TABLE phase70_employee_master
  ADD COLUMN IF NOT EXISTS biometric_id TEXT;

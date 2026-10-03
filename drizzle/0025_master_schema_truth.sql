-- SiteSync Pro 0025: canonical vendor / finance / HR master schema truth
-- Reconcile legacy baseline omissions without dropping or rewriting historical rows.

ALTER TABLE phase69_vendor_master
  ADD COLUMN IF NOT EXISTS company_name TEXT NOT NULL DEFAULT 'UNSPECIFIED';

ALTER TABLE phase60_chart_of_accounts
  ADD COLUMN IF NOT EXISTS account_name TEXT NOT NULL DEFAULT 'UNSPECIFIED';

ALTER TABLE phase70_employee_master
  ADD COLUMN IF NOT EXISTS work_location TEXT NOT NULL DEFAULT 'Unspecified';

-- SiteSync Pro 0028: RFQ item, AR, GL and payroll schema truth
-- Reconcile legacy table shapes with canonical Drizzle models.

ALTER TABLE phase69_rfq_items
  ADD COLUMN IF NOT EXISTS target_unit_price DOUBLE PRECISION;

ALTER TABLE phase60_ar_invoices
  ADD COLUMN IF NOT EXISTS customer_id TEXT,
  ADD COLUMN IF NOT EXISTS created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP::text;

ALTER TABLE phase60_general_ledger
  ADD COLUMN IF NOT EXISTS journal_id TEXT NOT NULL DEFAULT 'LEGACY';

ALTER TABLE phase70_payroll_periods
  ADD COLUMN IF NOT EXISTS start_date TEXT NOT NULL DEFAULT CURRENT_DATE::text,
  ADD COLUMN IF NOT EXISTS processed_at TEXT;

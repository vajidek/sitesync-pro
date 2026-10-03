-- SiteSync Pro 0027: RFQ, finance AP/journal and shift schema truth
-- Reconcile legacy table shapes with the canonical Drizzle models.

ALTER TABLE phase69_rfq
  ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'RFQ',
  ADD COLUMN IF NOT EXISTS invited_vendors_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE phase60_ap_invoices
  ADD COLUMN IF NOT EXISTS vendor_id TEXT,
  ADD COLUMN IF NOT EXISTS created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP::text;

ALTER TABLE phase60_journal_entries
  ADD COLUMN IF NOT EXISTS voucher_type TEXT NOT NULL DEFAULT 'GENERAL_JOURNAL',
  ADD COLUMN IF NOT EXISTS posting_date TEXT NOT NULL DEFAULT CURRENT_DATE::text,
  ADD COLUMN IF NOT EXISTS posted_by TEXT NOT NULL DEFAULT 'System';

ALTER TABLE phase70_shift_master
  ADD COLUMN IF NOT EXISTS end_time TEXT NOT NULL DEFAULT '17:00',
  ADD COLUMN IF NOT EXISTS grace_period_minutes INTEGER NOT NULL DEFAULT 15;

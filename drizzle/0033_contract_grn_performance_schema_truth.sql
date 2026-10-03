-- SiteSync Pro 0033: contract, GRN and performance-review schema truth
-- Compatibility layer for legacy databases; no historical records are removed.

ALTER TABLE phase69_contracts
  ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Contract',
  ADD COLUMN IF NOT EXISTS vendor_id TEXT,
  ADD COLUMN IF NOT EXISTS liquidated_damages_cap_percent DOUBLE PRECISION NOT NULL DEFAULT 0;

ALTER TABLE phase69_goods_receipts
  ADD COLUMN IF NOT EXISTS po_number TEXT,
  ADD COLUMN IF NOT EXISTS items_received_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'RECEIVED',
  ADD COLUMN IF NOT EXISTS created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP::text;

ALTER TABLE phase70_performance_reviews
  ADD COLUMN IF NOT EXISTS strengths TEXT,
  ADD COLUMN IF NOT EXISTS review_date TEXT NOT NULL DEFAULT CURRENT_DATE::text;

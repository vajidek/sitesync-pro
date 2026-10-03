-- SiteSync Pro 0031: purchase order and recruitment schema truth

ALTER TABLE phase69_purchase_orders
  ADD COLUMN IF NOT EXISTS pr_number TEXT,
  ADD COLUMN IF NOT EXISTS buyer_name TEXT NOT NULL DEFAULT 'Procurement Buyer';

ALTER TABLE phase70_recruitment
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'OPEN',
  ADD COLUMN IF NOT EXISTS created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP::text;

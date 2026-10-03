-- SiteSync Pro 0023: purchase order approval actor schema truth
ALTER TABLE phase56_purchase_orders
  ADD COLUMN IF NOT EXISTS issued_by TEXT;

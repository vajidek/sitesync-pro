-- SiteSync Pro 0029: vendor quotation and attendance schema truth

ALTER TABLE phase69_vendor_quotations
  ADD COLUMN IF NOT EXISTS rfq_id TEXT,
  ADD COLUMN IF NOT EXISTS technical_compliance_status TEXT NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS commercial_ranking INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS remarks TEXT;

ALTER TABLE phase70_attendance
  ADD COLUMN IF NOT EXISTS punch_source TEXT NOT NULL DEFAULT 'BIOMETRIC',
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;

-- SiteSync Pro 0025: procurement audit actor schema truth
ALTER TABLE procurement_logs
  ADD COLUMN IF NOT EXISTS performed_by TEXT NOT NULL DEFAULT 'SYSTEM_MIGRATION';

ALTER TABLE procurement_logs
  ALTER COLUMN performed_by DROP DEFAULT;

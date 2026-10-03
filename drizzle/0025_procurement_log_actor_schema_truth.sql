-- SiteSync Pro 0025: procurement audit actor schema truth
ALTER TABLE procurement_logs
  ADD COLUMN IF NOT EXISTS performed_by TEXT;

UPDATE procurement_logs
SET performed_by = 'SYSTEM_MIGRATION'
WHERE performed_by IS NULL;

ALTER TABLE procurement_logs
  ALTER COLUMN performed_by SET NOT NULL;

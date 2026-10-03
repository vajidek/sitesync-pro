-- SiteSync Pro 0024: procurement audit entity identity schema truth
ALTER TABLE procurement_logs
  ADD COLUMN IF NOT EXISTS entity_id TEXT NOT NULL DEFAULT 'LEGACY';

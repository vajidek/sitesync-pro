-- SiteSync Pro 0022: comparative statement approval schema truth
ALTER TABLE comparative_statements
  ADD COLUMN IF NOT EXISTS approved_by TEXT;

-- SiteSync Pro finance journal actor safety
-- Existing ledger rows are preserved; future journal rows must provide explicit actor identity.

ALTER TABLE phase60_journal_entries
  ALTER COLUMN posted_by DROP DEFAULT,
  ALTER COLUMN created_by DROP DEFAULT,
  ALTER COLUMN updated_by DROP DEFAULT;

ALTER TABLE phase60_journal_lines
  ALTER COLUMN created_by DROP DEFAULT,
  ALTER COLUMN updated_by DROP DEFAULT;

ALTER TABLE phase60_general_ledger
  ALTER COLUMN created_by DROP DEFAULT,
  ALTER COLUMN updated_by DROP DEFAULT;

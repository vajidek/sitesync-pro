-- SiteSync Pro Contract workflow governance
-- Align extension/variation persistence with request -> approval lifecycle.

ALTER TABLE IF EXISTS contract_extensions
  ADD COLUMN IF NOT EXISTS extension_document_number TEXT;

ALTER TABLE IF EXISTS contract_extensions
  ADD COLUMN IF NOT EXISTS requested_by TEXT;

ALTER TABLE IF EXISTS contract_extensions
  ALTER COLUMN approved_by DROP NOT NULL;

ALTER TABLE IF EXISTS contract_extensions
  ALTER COLUMN approved_date DROP NOT NULL;

ALTER TABLE IF EXISTS contract_extensions
  ALTER COLUMN status SET DEFAULT 'REQUESTED';

CREATE UNIQUE INDEX IF NOT EXISTS uq_contract_extensions_document_number
  ON contract_extensions(extension_document_number)
  WHERE extension_document_number IS NOT NULL;

ALTER TABLE IF EXISTS contract_variations
  ADD COLUMN IF NOT EXISTS created_by TEXT;

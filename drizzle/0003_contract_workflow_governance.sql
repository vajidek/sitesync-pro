-- Fresh-database bootstrap for contract workflow persistence.
-- These tables are referenced by this migration itself and therefore must exist before its indexes/ALTERs.
CREATE TABLE IF NOT EXISTS "contract_variations" (
  "id" TEXT PRIMARY KEY,
  "contract_id" TEXT NOT NULL,
  "variation_number" TEXT NOT NULL UNIQUE,
  "project_id" TEXT,
  "wbs_id" TEXT,
  "boq_item_id" TEXT,
  "cost_code_id" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "variation_type" TEXT NOT NULL DEFAULT 'ADDITION',
  "amount" DOUBLE PRECISION NOT NULL,
  "claimed_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "approved_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "time_extension_days" INTEGER NOT NULL DEFAULT 0,
  "claimed_time_extension_days" INTEGER NOT NULL DEFAULT 0,
  "approved_time_extension_days" INTEGER NOT NULL DEFAULT 0,
  "notice_date" TEXT,
  "event_date" TEXT,
  "change_event_reference" TEXT,
  "client_reference" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PROPOSED',
  "created_by" TEXT,
  "approved_by" TEXT,
  "approved_date" TEXT,
  "justification" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "contract_extensions" (
  "id" TEXT PRIMARY KEY,
  "contract_id" TEXT NOT NULL,
  "project_id" TEXT,
  "wbs_id" TEXT,
  "cause_type" TEXT,
  "change_event_reference" TEXT,
  "extension_number" INTEGER NOT NULL,
  "extension_document_number" TEXT UNIQUE,
  "extension_days" INTEGER NOT NULL,
  "original_end_date" TEXT NOT NULL,
  "new_end_date" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "notice_date" TEXT,
  "event_date" TEXT,
  "status" TEXT NOT NULL DEFAULT 'REQUESTED',
  "requested_by" TEXT,
  "approved_by" TEXT,
  "approved_date" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

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

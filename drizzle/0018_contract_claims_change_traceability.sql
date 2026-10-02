-- SiteSync Pro 0018: contract change / claim traceability
ALTER TABLE contract_variations
  ADD COLUMN IF NOT EXISTS project_id TEXT,
  ADD COLUMN IF NOT EXISTS wbs_id TEXT,
  ADD COLUMN IF NOT EXISTS boq_item_id TEXT,
  ADD COLUMN IF NOT EXISTS cost_code_id TEXT,
  ADD COLUMN IF NOT EXISTS claimed_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS approved_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS claimed_time_extension_days INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS approved_time_extension_days INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notice_date TEXT,
  ADD COLUMN IF NOT EXISTS event_date TEXT,
  ADD COLUMN IF NOT EXISTS change_event_reference TEXT,
  ADD COLUMN IF NOT EXISTS client_reference TEXT;

UPDATE contract_variations
SET claimed_amount = amount,
    claimed_time_extension_days = time_extension_days
WHERE claimed_amount = 0 AND amount <> 0;

ALTER TABLE contract_extensions
  ADD COLUMN IF NOT EXISTS project_id TEXT,
  ADD COLUMN IF NOT EXISTS wbs_id TEXT,
  ADD COLUMN IF NOT EXISTS cause_type TEXT,
  ADD COLUMN IF NOT EXISTS change_event_reference TEXT,
  ADD COLUMN IF NOT EXISTS notice_date TEXT,
  ADD COLUMN IF NOT EXISTS event_date TEXT;

CREATE TABLE IF NOT EXISTS contract_claims (
  id TEXT PRIMARY KEY,
  contract_id TEXT NOT NULL,
  project_id TEXT,
  wbs_id TEXT,
  boq_item_id TEXT,
  cost_code_id TEXT,
  claim_number TEXT NOT NULL UNIQUE,
  claim_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date TEXT,
  notice_date TEXT,
  claimed_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  approved_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  claimed_days INTEGER NOT NULL DEFAULT 0,
  approved_days INTEGER NOT NULL DEFAULT 0,
  client_reference TEXT,
  change_event_reference TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  created_by TEXT NOT NULL,
  reviewed_by TEXT,
  approved_by TEXT,
  approved_date TEXT,
  rejection_reason TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contract_change_evidence (
  id TEXT PRIMARY KEY,
  contract_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  document_id TEXT NOT NULL,
  evidence_type TEXT NOT NULL,
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT uq_contract_change_evidence UNIQUE (entity_type, entity_id, document_id)
);

CREATE INDEX IF NOT EXISTS idx_contract_variations_control_chain
  ON contract_variations(contract_id, project_id, wbs_id, boq_item_id, cost_code_id);

CREATE INDEX IF NOT EXISTS idx_contract_extensions_control_chain
  ON contract_extensions(contract_id, project_id, wbs_id);

CREATE INDEX IF NOT EXISTS idx_contract_claims_control_chain
  ON contract_claims(contract_id, project_id, wbs_id, boq_item_id, cost_code_id);

CREATE INDEX IF NOT EXISTS idx_contract_change_evidence_entity
  ON contract_change_evidence(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_contract_change_evidence_document
  ON contract_change_evidence(document_id);

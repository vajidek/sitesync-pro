-- SiteSync Pro Commercial ERP persistence baseline
-- Idempotent DDL for environments that have not yet applied the generated Drizzle migration.

CREATE TABLE IF NOT EXISTS commercial_tenders (
  id TEXT PRIMARY KEY,
  tender_ref_number TEXT NOT NULL UNIQUE,
  tender_title TEXT NOT NULL,
  client_authority TEXT NOT NULL,
  client_type TEXT NOT NULL,
  sector TEXT NOT NULL,
  tender_type TEXT NOT NULL,
  estimated_project_value DOUBLE PRECISION NOT NULL,
  currency TEXT NOT NULL,
  emd_amount DOUBLE PRECISION DEFAULT 0,
  tender_fee DOUBLE PRECISION DEFAULT 0,
  emd_mode TEXT,
  publication_date TEXT NOT NULL,
  pre_bid_meeting_date TEXT,
  submission_deadline TEXT NOT NULL,
  bid_validity_days INTEGER DEFAULT 0,
  eligibility_criteria TEXT,
  technical_score_threshold DOUBLE PRECISION,
  quoted_bid_amount DOUBLE PRECISION,
  expected_gross_margin_percent DOUBLE PRECISION,
  bid_manager_id TEXT,
  bid_manager_name TEXT,
  status TEXT NOT NULL,
  award_details JSONB,
  documents JSONB,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_commercial_tenders_status ON commercial_tenders(status);
CREATE INDEX IF NOT EXISTS idx_commercial_tenders_deadline ON commercial_tenders(submission_deadline);

CREATE TABLE IF NOT EXISTS commercial_rate_analyses (
  id TEXT PRIMARY KEY,
  analysis_code TEXT NOT NULL UNIQUE,
  tender_id TEXT,
  boq_item_id TEXT,
  item_code TEXT NOT NULL,
  item_description TEXT NOT NULL,
  unit TEXT NOT NULL,
  material_cost_per_unit DOUBLE PRECISION DEFAULT 0,
  labor_cost_per_unit DOUBLE PRECISION DEFAULT 0,
  machinery_cost_per_unit DOUBLE PRECISION DEFAULT 0,
  subcontract_cost_per_unit DOUBLE PRECISION DEFAULT 0,
  overhead_percent DOUBLE PRECISION DEFAULT 0,
  profit_percent DOUBLE PRECISION DEFAULT 0,
  net_rate_per_unit DOUBLE PRECISION NOT NULL,
  quoted_rate_per_unit DOUBLE PRECISION NOT NULL,
  components_breakdown JSONB,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_commercial_rate_analyses_tender ON commercial_rate_analyses(tender_id);
CREATE INDEX IF NOT EXISTS idx_commercial_rate_analyses_boq ON commercial_rate_analyses(boq_item_id);

CREATE TABLE IF NOT EXISTS commercial_subcontracts (
  id TEXT PRIMARY KEY,
  agreement_number TEXT NOT NULL UNIQUE,
  subcontractor_name TEXT NOT NULL,
  subcontractor_code TEXT NOT NULL,
  project_id TEXT NOT NULL,
  project_name TEXT,
  contract_id TEXT,
  wbs_id TEXT,
  package_title TEXT NOT NULL,
  trade_category TEXT NOT NULL,
  contract_type TEXT NOT NULL,
  contract_value DOUBLE PRECISION NOT NULL,
  currency TEXT NOT NULL,
  retention_percent DOUBLE PRECISION DEFAULT 0,
  mobilization_advance_percent DOUBLE PRECISION DEFAULT 0,
  mobilization_advance_paid DOUBLE PRECISION DEFAULT 0,
  mobilization_advance_recovered DOUBLE PRECISION DEFAULT 0,
  total_billed_amount DOUBLE PRECISION DEFAULT 0,
  total_certified_amount DOUBLE PRECISION DEFAULT 0,
  total_paid_amount DOUBLE PRECISION DEFAULT 0,
  total_retention_withheld DOUBLE PRECISION DEFAULT 0,
  start_date TEXT NOT NULL,
  completion_date TEXT,
  status TEXT NOT NULL,
  performance_rating DOUBLE PRECISION,
  compliance_documents_verified BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_commercial_subcontracts_project ON commercial_subcontracts(project_id);
CREATE INDEX IF NOT EXISTS idx_commercial_subcontracts_status ON commercial_subcontracts(status);

CREATE TABLE IF NOT EXISTS commercial_subcontract_bills (
  id TEXT PRIMARY KEY,
  subcontract_id TEXT NOT NULL,
  subcontract_number TEXT NOT NULL,
  subcontractor_name TEXT NOT NULL,
  bill_number TEXT NOT NULL,
  bill_period_start TEXT NOT NULL,
  bill_period_end TEXT NOT NULL,
  submission_date TEXT NOT NULL,
  gross_claimed_amount DOUBLE PRECISION NOT NULL,
  certified_amount DOUBLE PRECISION DEFAULT 0,
  currency TEXT NOT NULL,
  retention_percent DOUBLE PRECISION DEFAULT 0,
  retention_amount DOUBLE PRECISION DEFAULT 0,
  mobilization_recovery DOUBLE PRECISION DEFAULT 0,
  other_deductions DOUBLE PRECISION DEFAULT 0,
  net_certified_payable DOUBLE PRECISION DEFAULT 0,
  status TEXT NOT NULL,
  certified_by TEXT,
  certified_date TEXT,
  remarks TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CONSTRAINT uq_commercial_subcontract_bill UNIQUE (subcontract_id, bill_number)
);

CREATE INDEX IF NOT EXISTS idx_commercial_subcontract_bills_subcontract ON commercial_subcontract_bills(subcontract_id);
CREATE INDEX IF NOT EXISTS idx_commercial_subcontract_bills_status ON commercial_subcontract_bills(status);

CREATE TABLE IF NOT EXISTS commercial_variation_orders (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  project_name TEXT,
  contract_id TEXT,
  wbs_id TEXT,
  boq_item_id TEXT,
  vo_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  scope_description TEXT NOT NULL,
  variation_type TEXT NOT NULL,
  claimed_amount DOUBLE PRECISION NOT NULL,
  approved_amount DOUBLE PRECISION DEFAULT 0,
  currency TEXT NOT NULL,
  time_extension_days INTEGER DEFAULT 0,
  impact_on_critical_path BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL,
  client_reference TEXT,
  submitted_date TEXT NOT NULL,
  approved_date TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_commercial_variations_project ON commercial_variation_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_commercial_variations_contract ON commercial_variation_orders(contract_id);
CREATE INDEX IF NOT EXISTS idx_commercial_variations_status ON commercial_variation_orders(status);

CREATE TABLE IF NOT EXISTS commercial_client_ipcs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  project_name TEXT,
  contract_id TEXT,
  ipc_number TEXT NOT NULL UNIQUE,
  billing_period TEXT NOT NULL,
  gross_work_done_claimed DOUBLE PRECISION NOT NULL,
  gross_work_done_certified DOUBLE PRECISION DEFAULT 0,
  materials_on_site_value DOUBLE PRECISION DEFAULT 0,
  retention_deduction DOUBLE PRECISION DEFAULT 0,
  mobilization_recovery DOUBLE PRECISION DEFAULT 0,
  statutory_tds DOUBLE PRECISION DEFAULT 0,
  net_receivable_amount DOUBLE PRECISION DEFAULT 0,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  submission_date TEXT NOT NULL,
  certification_date TEXT,
  due_date TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_commercial_client_ipcs_project ON commercial_client_ipcs(project_id);
CREATE INDEX IF NOT EXISTS idx_commercial_client_ipcs_contract ON commercial_client_ipcs(contract_id);
CREATE INDEX IF NOT EXISTS idx_commercial_client_ipcs_status ON commercial_client_ipcs(status);

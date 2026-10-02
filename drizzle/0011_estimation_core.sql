-- SiteSync Pro 0011: enterprise estimation core
CREATE TABLE IF NOT EXISTS estimate_headers (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  branch_id TEXT,
  tender_id TEXT,
  project_id TEXT,
  estimate_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  estimate_type TEXT NOT NULL,
  currency TEXT NOT NULL,
  description TEXT,
  current_revision_number INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_by_name TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_estimate_headers_company ON estimate_headers(company_id);
CREATE INDEX IF NOT EXISTS idx_estimate_headers_project ON estimate_headers(project_id);
CREATE INDEX IF NOT EXISTS idx_estimate_headers_tender ON estimate_headers(tender_id);
CREATE INDEX IF NOT EXISTS idx_estimate_headers_status ON estimate_headers(status);

CREATE TABLE IF NOT EXISTS estimate_revisions (
  id TEXT PRIMARY KEY,
  estimate_id TEXT NOT NULL,
  revision_number INTEGER NOT NULL,
  revision_label TEXT,
  status TEXT NOT NULL,
  description TEXT,
  direct_cost DOUBLE PRECISION NOT NULL DEFAULT 0,
  overhead_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  contingency_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  profit_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  tax_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  total_cost DOUBLE PRECISION NOT NULL DEFAULT 0,
  total_price DOUBLE PRECISION NOT NULL DEFAULT 0,
  approved_by TEXT,
  approved_at TEXT,
  created_by TEXT NOT NULL,
  created_by_name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CONSTRAINT uq_estimate_revision UNIQUE (estimate_id, revision_number)
);
CREATE INDEX IF NOT EXISTS idx_estimate_revisions_estimate ON estimate_revisions(estimate_id);
CREATE INDEX IF NOT EXISTS idx_estimate_revisions_status ON estimate_revisions(status);

CREATE TABLE IF NOT EXISTS estimate_lines (
  id TEXT PRIMARY KEY,
  revision_id TEXT NOT NULL,
  line_number INTEGER NOT NULL,
  item_code TEXT NOT NULL,
  description TEXT NOT NULL,
  unit TEXT NOT NULL,
  quantity DOUBLE PRECISION NOT NULL,
  direct_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
  direct_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  overhead_percent DOUBLE PRECISION NOT NULL DEFAULT 0,
  profit_percent DOUBLE PRECISION NOT NULL DEFAULT 0,
  quoted_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
  quoted_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  wbs_id TEXT,
  boq_item_id TEXT,
  cost_code_id TEXT,
  cost_code TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CONSTRAINT uq_estimate_line_number UNIQUE (revision_id, line_number)
);
CREATE INDEX IF NOT EXISTS idx_estimate_lines_revision ON estimate_lines(revision_id);
CREATE INDEX IF NOT EXISTS idx_estimate_lines_boq ON estimate_lines(boq_item_id);
CREATE INDEX IF NOT EXISTS idx_estimate_lines_cost_code ON estimate_lines(cost_code_id);

CREATE TABLE IF NOT EXISTS estimate_resources (
  id TEXT PRIMARY KEY,
  line_id TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_code TEXT,
  description TEXT NOT NULL,
  unit TEXT NOT NULL,
  quantity DOUBLE PRECISION NOT NULL,
  unit_rate DOUBLE PRECISION NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_estimate_resources_line ON estimate_resources(line_id);
CREATE INDEX IF NOT EXISTS idx_estimate_resources_type ON estimate_resources(resource_type);

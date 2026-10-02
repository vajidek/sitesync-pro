-- SiteSync Pro 0011: purchase request project/WBS/BOQ/cost-code traceability
-- Existing records remain compatible because the new allocation fields are nullable.
-- New production/UAT purchase requests are validated by the repository workflow.

ALTER TABLE purchase_requests ADD COLUMN IF NOT EXISTS wbs_id TEXT;
ALTER TABLE purchase_requests ADD COLUMN IF NOT EXISTS boq_item_id TEXT;
ALTER TABLE purchase_requests ADD COLUMN IF NOT EXISTS cost_code_id TEXT;
ALTER TABLE purchase_requests ADD COLUMN IF NOT EXISTS cost_code TEXT;

CREATE INDEX IF NOT EXISTS idx_purchase_requests_project_wbs_cost
  ON purchase_requests(project_id, wbs_id, cost_code_id);

CREATE INDEX IF NOT EXISTS idx_purchase_requests_boq_item
  ON purchase_requests(boq_item_id);

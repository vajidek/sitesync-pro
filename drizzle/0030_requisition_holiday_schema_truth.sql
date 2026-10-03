-- SiteSync Pro 0030: requisition and holiday schema truth

ALTER TABLE phase69_purchase_requisitions
  ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Purchase Requisition',
  ADD COLUMN IF NOT EXISTS estimated_cost_aed DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS workflow_step TEXT NOT NULL DEFAULT 'REQUESTED';

ALTER TABLE phase70_holidays
  ADD COLUMN IF NOT EXISTS is_optional BOOLEAN NOT NULL DEFAULT FALSE;

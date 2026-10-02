-- SiteSync Pro 0010: fleet project/WBS/BOQ/cost-code traceability
ALTER TABLE fleet_maintenance ADD COLUMN IF NOT EXISTS project_id TEXT;
ALTER TABLE fleet_maintenance ADD COLUMN IF NOT EXISTS project_name TEXT;
ALTER TABLE fleet_maintenance ADD COLUMN IF NOT EXISTS wbs_id TEXT;
ALTER TABLE fleet_maintenance ADD COLUMN IF NOT EXISTS boq_item_id TEXT;
ALTER TABLE fleet_maintenance ADD COLUMN IF NOT EXISTS cost_code_id TEXT;
ALTER TABLE fleet_maintenance ADD COLUMN IF NOT EXISTS cost_code TEXT;

ALTER TABLE fleet_trip_logs ADD COLUMN IF NOT EXISTS wbs_id TEXT;
ALTER TABLE fleet_trip_logs ADD COLUMN IF NOT EXISTS boq_item_id TEXT;
ALTER TABLE fleet_trip_logs ADD COLUMN IF NOT EXISTS cost_code_id TEXT;
ALTER TABLE fleet_trip_logs ADD COLUMN IF NOT EXISTS cost_code TEXT;

CREATE INDEX IF NOT EXISTS idx_fleet_maintenance_project_wbs
  ON fleet_maintenance(project_id, wbs_id, cost_code_id);
CREATE INDEX IF NOT EXISTS idx_fleet_trip_project_wbs
  ON fleet_trip_logs(project_id, wbs_id, cost_code_id);

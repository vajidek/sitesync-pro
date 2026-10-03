-- SiteSync Pro 0019: HSE operational module integrity
-- Reconcile the legacy environmental-monitoring baseline with the canonical
-- operational model before enforcing its data-integrity rule.
ALTER TABLE phase63_environment_monitoring
  ADD COLUMN IF NOT EXISTS location TEXT NOT NULL DEFAULT 'UNSPECIFIED',
  ADD COLUMN IF NOT EXISTS measured_value DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS permissible_limit DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monitoring_date TEXT NOT NULL DEFAULT CURRENT_DATE::text;

ALTER TABLE phase63_environment_monitoring
  ALTER COLUMN location DROP DEFAULT,
  ALTER COLUMN measured_value DROP DEFAULT,
  ALTER COLUMN permissible_limit DROP DEFAULT,
  ALTER COLUMN monitoring_date DROP DEFAULT;

-- Replace human-looking schema fallbacks with an explicit DEMO-only actor marker.
ALTER TABLE phase63_toolbox_talks
  ALTER COLUMN created_by SET DEFAULT 'SYSTEM_DEMO_SEED',
  ALTER COLUMN updated_by SET DEFAULT 'SYSTEM_DEMO_SEED';

ALTER TABLE phase63_ppe_issuance
  ALTER COLUMN created_by SET DEFAULT 'SYSTEM_DEMO_SEED',
  ALTER COLUMN updated_by SET DEFAULT 'SYSTEM_DEMO_SEED';

ALTER TABLE phase63_training_records
  ALTER COLUMN created_by SET DEFAULT 'SYSTEM_DEMO_SEED',
  ALTER COLUMN updated_by SET DEFAULT 'SYSTEM_DEMO_SEED';

ALTER TABLE phase63_emergency_drills
  ALTER COLUMN created_by SET DEFAULT 'SYSTEM_DEMO_SEED',
  ALTER COLUMN updated_by SET DEFAULT 'SYSTEM_DEMO_SEED';

ALTER TABLE phase63_fire_equipment
  ALTER COLUMN created_by SET DEFAULT 'SYSTEM_DEMO_SEED',
  ALTER COLUMN updated_by SET DEFAULT 'SYSTEM_DEMO_SEED';

ALTER TABLE phase63_environment_monitoring
  ALTER COLUMN created_by SET DEFAULT 'SYSTEM_DEMO_SEED',
  ALTER COLUMN updated_by SET DEFAULT 'SYSTEM_DEMO_SEED';

ALTER TABLE phase63_waste_management
  ALTER COLUMN created_by SET DEFAULT 'SYSTEM_DEMO_SEED',
  ALTER COLUMN updated_by SET DEFAULT 'SYSTEM_DEMO_SEED';

-- Database-level collision protection for operational document identifiers.
CREATE UNIQUE INDEX IF NOT EXISTS uq_hse_toolbox_tbt_number
  ON phase63_toolbox_talks(tbt_number)
  WHERE is_deleted = FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS uq_hse_safety_inspection_number
  ON phase63_safety_inspections(inspection_number)
  WHERE is_deleted = FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS uq_hse_ppe_issuance_number
  ON phase63_ppe_issuance(issuance_number)
  WHERE is_deleted = FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS uq_hse_training_number
  ON phase63_training_records(training_number)
  WHERE is_deleted = FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS uq_hse_emergency_drill_number
  ON phase63_emergency_drills(drill_number)
  WHERE is_deleted = FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS uq_hse_fire_equipment_tag
  ON phase63_fire_equipment(equipment_tag)
  WHERE is_deleted = FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS uq_hse_environment_record_number
  ON phase63_environment_monitoring(record_number)
  WHERE is_deleted = FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS uq_hse_waste_manifest_number
  ON phase63_waste_management(manifest_number)
  WHERE is_deleted = FALSE;

-- Fail-closed data integrity checks.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ck_hse_safety_inspection_counts'
  ) THEN
    ALTER TABLE phase63_safety_inspections
      ADD CONSTRAINT ck_hse_safety_inspection_counts
      CHECK (
        total_items_checked > 0
        AND compliant_items >= 0
        AND non_compliant_items >= 0
        AND compliant_items + non_compliant_items = total_items_checked
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ck_hse_training_validity'
  ) THEN
    ALTER TABLE phase63_training_records
      ADD CONSTRAINT ck_hse_training_validity
      CHECK (validity_months > 0 AND participants_count > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ck_hse_emergency_drill_values'
  ) THEN
    ALTER TABLE phase63_emergency_drills
      ADD CONSTRAINT ck_hse_emergency_drill_values
      CHECK (evacuation_time_seconds > 0 AND participants_count > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ck_hse_environment_limit'
  ) THEN
    ALTER TABLE phase63_environment_monitoring
      ADD CONSTRAINT ck_hse_environment_limit
      CHECK (permissible_limit >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ck_hse_waste_quantity'
  ) THEN
    ALTER TABLE phase63_waste_management
      ADD CONSTRAINT ck_hse_waste_quantity
      CHECK (quantity_kg > 0);
  END IF;
END
$$;

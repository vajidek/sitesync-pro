-- Raw biometric punches remain immutable.
-- Existing rows may not have source_fingerprint; new sync writes populate it.
ALTER TABLE hr_biometric_raw_punches
  ADD COLUMN IF NOT EXISTS source_fingerprint TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_hr_biometric_raw_source_fingerprint
  ON hr_biometric_raw_punches(source_fingerprint);

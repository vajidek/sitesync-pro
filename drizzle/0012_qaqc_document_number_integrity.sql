-- SiteSync Pro 0012: QA/QC document-number integrity
-- UUID-backed suffixes are used by QA/QC creation when no configured number is supplied.
-- These indexes prevent duplicate inspection/NCR identifiers at the database boundary.

CREATE UNIQUE INDEX IF NOT EXISTS uq_phase62_inspections_number
  ON phase62_inspections(inspection_number);

CREATE UNIQUE INDEX IF NOT EXISTS uq_phase62_ncr_number
  ON phase62_ncr(ncr_number);

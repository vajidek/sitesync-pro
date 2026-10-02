-- SiteSync Pro 0014: QA/QC ITP document-number integrity
CREATE UNIQUE INDEX IF NOT EXISTS uq_phase62_itp_number
  ON phase62_itp_masters(itp_number);

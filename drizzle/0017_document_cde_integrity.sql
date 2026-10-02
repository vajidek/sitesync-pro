-- SiteSync Pro 0017: CDE version and checkout integrity
-- One active revision number per document prevents concurrent/racy duplicate revisions.
CREATE UNIQUE INDEX IF NOT EXISTS uq_phase61_document_version_revision_active
  ON phase61_document_versions(document_id, revision_number)
  WHERE is_deleted = false;

-- A document can have at most one active checkout at a time.
CREATE UNIQUE INDEX IF NOT EXISTS uq_phase61_document_checkout_active
  ON phase61_document_checkouts(document_id)
  WHERE is_checked_in = false AND is_deleted = false;

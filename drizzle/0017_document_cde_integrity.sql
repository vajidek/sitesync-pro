-- SiteSync Pro 0017: CDE version and checkout integrity
-- The baseline repair migration predates revisionNumber in the canonical
-- document-version model. Reconcile the column before enforcing uniqueness.
ALTER TABLE phase61_document_versions
  ADD COLUMN IF NOT EXISTS revision_number INTEGER;

-- Preserve existing versions while deterministically assigning revision
-- numbers per document. New records use the same database default as the ORM.
WITH ranked_versions AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY document_id
      ORDER BY created_at ASC, id ASC
    ) AS calculated_revision
  FROM phase61_document_versions
  WHERE revision_number IS NULL
)
UPDATE phase61_document_versions v
SET revision_number = ranked_versions.calculated_revision
FROM ranked_versions
WHERE v.id = ranked_versions.id;

ALTER TABLE phase61_document_versions
  ALTER COLUMN revision_number SET DEFAULT 1,
  ALTER COLUMN revision_number SET NOT NULL;

-- One active revision number per document prevents concurrent/racy duplicate revisions.
CREATE UNIQUE INDEX IF NOT EXISTS uq_phase61_document_version_revision_active
  ON phase61_document_versions(document_id, revision_number)
  WHERE is_deleted = false;

-- A document can have at most one active checkout at a time.
CREATE UNIQUE INDEX IF NOT EXISTS uq_phase61_document_checkout_active
  ON phase61_document_checkouts(document_id)
  WHERE is_checked_in = false AND is_deleted = false;

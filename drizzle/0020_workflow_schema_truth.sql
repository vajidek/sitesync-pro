-- SiteSync Pro 0020: workflow governance schema truth
-- Reconcile legacy workflow tables with the canonical governance engine.
-- Existing rows are preserved; deterministic values are backfilled where the
-- baseline lacked required identity fields.

ALTER TABLE phase66_workflows
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS min_approval_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS policy_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS verification_required BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS approval_required BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS prevent_maker_verification BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS prevent_maker_approval BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS prevent_verifier_approval BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS require_higher_authority BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS hierarchy_scope TEXT NOT NULL DEFAULT 'PROJECT';

UPDATE phase66_workflows
SET name = code || ' Workflow'
WHERE name IS NULL;

ALTER TABLE phase66_workflows
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN min_approval_amount DROP DEFAULT,
  ALTER COLUMN hierarchy_scope DROP DEFAULT;

ALTER TABLE phase66_workflow_steps
  ADD COLUMN IF NOT EXISTS approver_user_id TEXT,
  ADD COLUMN IF NOT EXISTS condition_expression TEXT NOT NULL DEFAULT 'true';

ALTER TABLE phase66_workflow_steps
  ALTER COLUMN condition_expression DROP DEFAULT;

ALTER TABLE phase66_workflow_instances
  ADD COLUMN IF NOT EXISTS entity_id TEXT,
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'NORMAL',
  ADD COLUMN IF NOT EXISTS data_context_json TEXT NOT NULL DEFAULT '{}';

UPDATE phase66_workflow_instances
SET entity_id = id
WHERE entity_id IS NULL;

ALTER TABLE phase66_workflow_instances
  ALTER COLUMN entity_id SET NOT NULL,
  ALTER COLUMN priority DROP DEFAULT,
  ALTER COLUMN data_context_json DROP DEFAULT;

ALTER TABLE phase66_workflow_tasks
  ADD COLUMN IF NOT EXISTS due_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP::text;

ALTER TABLE phase66_workflow_tasks
  ALTER COLUMN due_date DROP DEFAULT;

ALTER TABLE phase66_workflow_approvals
  ADD COLUMN IF NOT EXISTS comments TEXT;

ALTER TABLE phase66_workflow_history
  ADD COLUMN IF NOT EXISTS performed_by TEXT NOT NULL DEFAULT 'SYSTEM_MIGRATION';

ALTER TABLE phase66_workflow_history
  ALTER COLUMN performed_by DROP DEFAULT;

ALTER TABLE phase66_notifications
  ADD COLUMN IF NOT EXISTS severity TEXT NOT NULL DEFAULT 'INFO',
  ADD COLUMN IF NOT EXISTS link_url TEXT;

ALTER TABLE phase66_notifications
  ALTER COLUMN severity DROP DEFAULT;

ALTER TABLE phase66_notification_templates
  ADD COLUMN IF NOT EXISTS subject_template TEXT NOT NULL DEFAULT '';

ALTER TABLE phase66_notification_templates
  ALTER COLUMN subject_template DROP DEFAULT;

ALTER TABLE phase66_email_queue
  ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0;

ALTER TABLE phase66_email_queue
  ALTER COLUMN attempts DROP DEFAULT;

ALTER TABLE phase66_escalations
  ADD COLUMN IF NOT EXISTS created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP::text;

ALTER TABLE phase66_escalations
  ALTER COLUMN created_at DROP DEFAULT;

ALTER TABLE phase66_delegations
  ADD COLUMN IF NOT EXISTS start_date TEXT NOT NULL DEFAULT CURRENT_DATE::text,
  ADD COLUMN IF NOT EXISTS reason TEXT;

ALTER TABLE phase66_delegations
  ALTER COLUMN start_date DROP DEFAULT;

ALTER TABLE phase66_system_announcements
  ADD COLUMN IF NOT EXISTS published_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP::text;

ALTER TABLE phase66_system_announcements
  ALTER COLUMN published_at DROP DEFAULT;

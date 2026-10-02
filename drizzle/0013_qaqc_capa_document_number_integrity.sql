-- SiteSync Pro 0013: QA/QC CAPA document-number integrity
CREATE UNIQUE INDEX IF NOT EXISTS uq_phase62_capa_number
  ON phase62_corrective_actions(capa_number);

CREATE UNIQUE INDEX IF NOT EXISTS uq_phase62_preventive_action_number
  ON phase62_preventive_actions(preventive_action_number);

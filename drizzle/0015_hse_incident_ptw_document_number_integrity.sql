-- SiteSync Pro 0015: HSE incident / permit document-number integrity
CREATE UNIQUE INDEX IF NOT EXISTS uq_phase63_incident_number
  ON phase63_incidents(incident_number);

CREATE UNIQUE INDEX IF NOT EXISTS uq_phase63_work_permit_number
  ON phase63_work_permits(permit_number);

-- SiteSync Pro 0016: HSE risk assessment / JSA document-number integrity
CREATE UNIQUE INDEX IF NOT EXISTS uq_phase63_risk_assessment_number
  ON phase63_risk_assessments(assessment_number);

CREATE UNIQUE INDEX IF NOT EXISTS uq_phase63_jsa_number
  ON phase63_jsa(jsa_number);

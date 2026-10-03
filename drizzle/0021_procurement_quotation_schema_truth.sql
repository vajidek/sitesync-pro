-- SiteSync Pro 0021: legacy procurement quotation schema truth
-- The canonical vendor quotation model includes technical scoring; the baseline
-- omitted it while retaining commercial and overall scores.

ALTER TABLE vendor_quotations
  ADD COLUMN IF NOT EXISTS technical_score DOUBLE PRECISION NOT NULL DEFAULT 0;

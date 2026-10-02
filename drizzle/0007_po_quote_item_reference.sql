-- Persist the accepted vendor quotation line used to create each PO line.
ALTER TABLE IF EXISTS phase69_po_items
  ADD COLUMN IF NOT EXISTS quote_item_id TEXT;

CREATE INDEX IF NOT EXISTS idx_p69_po_items_quote_item
  ON phase69_po_items(quote_item_id);

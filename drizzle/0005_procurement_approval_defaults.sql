-- SiteSync Pro procurement approval lifecycle defaults
-- Do not allow enterprise purchase orders or receipts to appear approved/issued on creation.

ALTER TABLE IF EXISTS phase69_purchase_orders
  ALTER COLUMN currency DROP DEFAULT;

ALTER TABLE IF EXISTS phase69_purchase_orders
  ALTER COLUMN status SET DEFAULT 'PENDING_APPROVAL';

ALTER TABLE IF EXISTS phase69_purchase_orders
  ALTER COLUMN approved_by DROP NOT NULL;

ALTER TABLE IF EXISTS phase69_purchase_orders
  ALTER COLUMN approved_by DROP DEFAULT;

ALTER TABLE IF EXISTS phase69_goods_receipts
  ALTER COLUMN status SET DEFAULT 'UNDER_INSPECTION';

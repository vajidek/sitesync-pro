import fs from 'fs';
import path from 'path';

function scanAll(dir: string, fileList: string[] = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== 'node_modules' && e.name !== '.git' && e.name !== 'dist') {
        scanAll(full, fileList);
      }
    } else if (full.endsWith('.ts') || full.endsWith('.tsx')) {
      fileList.push(full);
    }
  }
  return fileList;
}

const files = scanAll('src');

const targets = [
  'legacyPurchaseOrders',
  'purchaseOrders',
  'goodsReceipts',
  'goodsReceiptItems',
  'purchaseOrderItems',
  'purchaseOrderRevisions',
  'purchaseOrderApprovals',
  'purchaseRequisitions',
  'purchaseRequisitionItems',
  'purchaseRequests',
  'requestForQuotations',
  'rfqItems',
  'rfqVendors',
  'vendorQuotations',
  'vendorQuotationItems',
  'procurementPurchaseOrdersTable',
  'procurementPurchaseOrders',
  'procurementGrnsTable',
  'procurementGrns',
  'phase56',
  'phase69PurchaseOrders',
  'phase69GoodsReceipts',
  'phase69Rfq',
  'phase69VendorQuotations',
  'phase69PurchaseRequisitions',
];

console.log('=== DETAILED INVENTORY OF ALL REFERENCES IN SRC/ ===');
const inventory: any[] = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    for (const target of targets) {
      if (line.includes(target)) {
        inventory.push({
          file,
          lineNum: idx + 1,
          target,
          text: line.trim()
        });
      }
    }
  });
}

console.log(`Total occurrences found: ${inventory.length}`);
for (const item of inventory) {
  console.log(`${item.file}:${item.lineNum} [${item.target}] -> ${item.text}`);
}

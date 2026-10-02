import fs from 'fs';
import path from 'path';

function scanComponents(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      scanComponents(full);
    } else if (full.endsWith('.tsx') || full.endsWith('.ts')) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (
          line.includes('/api/procurement') ||
          line.includes('/api/inventory/purchase-orders') ||
          line.includes('/api/inventory/goods-receipts') ||
          line.includes('/api/reports') ||
          line.includes('/api/dashboards') ||
          line.includes('/api/phase69')
        ) {
          console.log(`${full}:L${idx + 1}: ${line.trim()}`);
        }
      });
    }
  }
}

console.log('=== FRONTEND API ENDPOINT USAGE ===');
scanComponents('src/components');
scanComponents('src/pages');
scanComponents('src/context');
scanComponents('src/hooks');

import fs from 'fs';

const filesToInspect = [
  'src/api/routes/procurement.routes.ts',
  'src/api/routes/procurement_enterprise.routes.ts',
  'src/api/routes/inventory.routes.ts',
  'src/api/routes/reports.routes.ts',
  'src/api/routes/dashboards.routes.ts',
  'src/api/controllers/procurement.controller.ts',
  'src/api/controllers/procurement_enterprise.controller.ts',
  'src/api/controllers/inventory.controller.ts',
  'src/api/controllers/reports.controller.ts',
  'src/api/controllers/dashboards.controller.ts',
  'src/api/services/procurement.service.ts',
  'src/api/services/procurement_enterprise.service.ts',
  'src/api/services/inventory.service.ts',
  'src/api/repositories/procurement.repository.ts',
  'src/api/repositories/procurement_enterprise.repository.ts',
  'src/api/repositories/inventory.repository.ts',
  'src/api/repositories/reports.repository.ts',
  'src/api/repositories/dashboards.repository.ts',
  'src/api/repositories/project.repository.ts'
];

console.log('=== ENDPOINTS & REPOSITORIES TRACE ===');
for (const file of filesToInspect) {
  if (!fs.existsSync(file)) {
    console.log(`File NOT FOUND: ${file}`);
    continue;
  }
  const content = fs.readFileSync(file, 'utf8');
  console.log(`File: ${file} (lines: ${content.split('\n').length})`);
}

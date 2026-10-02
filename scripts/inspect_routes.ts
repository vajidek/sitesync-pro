import fs from 'fs';

function findMethods(filepath: string) {
  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split('\n');
  console.log(`\n======================================================`);
  console.log(`AUDITING: ${filepath}`);
  console.log(`======================================================`);
  lines.forEach((line, idx) => {
    if (
      line.includes('router.') ||
      line.includes('async ') ||
      line.includes('Repository.') ||
      line.includes('repository.') ||
      line.includes('Service.') ||
      line.includes('service.')
    ) {
      console.log(`L${idx+1}: ${line.trim()}`);
    }
  });
}

findMethods('src/api/routes/procurement.routes.ts');
findMethods('src/api/routes/inventory.routes.ts');
findMethods('src/api/controllers/procurement.controller.ts');
findMethods('src/api/controllers/inventory.controller.ts');

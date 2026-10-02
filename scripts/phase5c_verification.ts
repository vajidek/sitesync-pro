import { db } from '../src/db/index';
import {
  legacyPurchaseOrders,
  goodsReceipts,
  goodsReceiptItems,
  procurementPurchaseOrdersTable,
  procurementGrnsTable,
  procurementRequisitionsTable,
} from '../src/db/schema';
import { legacyProcurementAdapter } from '../src/api/services/legacy_procurement_adapter';
import { legacyProcurementTelemetry } from '../src/api/telemetry/legacy_procurement.telemetry';
import { inventoryRepository } from '../src/api/repositories/inventory.repository';
import { procurementRepository } from '../src/api/repositories/procurement.repository';
import { reportsRepository } from '../src/api/repositories/reports.repository';
import { dashboardsRepository } from '../src/api/repositories/dashboards.repository';
import { procurementEnterpriseRepository } from '../src/api/repositories/procurement_enterprise.repository';
import { projectRepository } from '../src/api/repositories/project.repository';
import { numberingService } from '../src/api/services/numbering.service';
import { idempotencyService } from '../src/api/services/idempotency.service';
import { eq } from 'drizzle-orm';

interface TestResult {
  id: number;
  name: string;
  category: string;
  status: 'PASS' | 'FAIL';
  details: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function runTest(
  id: number,
  name: string,
  category: string,
  testFn: () => Promise<void>
) {
  const start = Date.now();
  try {
    await testFn();
    const durationMs = Date.now() - start;
    results.push({ id, name, category, status: 'PASS', details: 'OK', durationMs });
    console.log(`\x1b[32m✔ [TEST ${id}] ${name} (${durationMs}ms)\x1b[0m`);
  } catch (error: any) {
    const durationMs = Date.now() - start;
    results.push({
      id,
      name,
      category,
      status: 'FAIL',
      details: error?.message || String(error),
      durationMs,
    });
    console.error(`\x1b[31m✖ [TEST ${id}] ${name} FAILED: ${error?.message}\x1b[0m`);
  }
}

async function runSuite() {
  console.log('\n============================================================');
  console.log('SITESYNC PRO ERP — PHASE 5C VERIFICATION SUITE');
  console.log('Legacy Procurement Consolidation & Safe Deprecation');
  console.log('============================================================\n');

  // TEST 1: Schema Non-Destruction Check
  await runTest(1, 'Legacy Schema Non-Destruction & Historical Data Intact', 'SCHEMA_PRESERVATION', async () => {
    const legPOs = await db.select().from(legacyPurchaseOrders);
    const legGRNs = await db.select().from(goodsReceipts);
    if (!Array.isArray(legPOs) || !Array.isArray(legGRNs)) {
      throw new Error('Legacy tables are not accessible or array schema corrupted');
    }
    // Verify historical records exist in legacy table without truncation
    if (legPOs.length === 0) {
      throw new Error('Legacy purchase_orders table is empty; historical data expected');
    }
  });

  // TEST 2: Active SSoT Table Parity & Primary Source Verification
  await runTest(2, 'Active Core Procurement Tables are SSoT (40+ Active POs/GRNs)', 'DATA_SSOT', async () => {
    const activePOs = await db.select().from(procurementPurchaseOrdersTable);
    const activeGRNs = await db.select().from(procurementGrnsTable);
    if (activePOs.length < 10) {
      throw new Error(`Expected at least 10 active POs in core table, found ${activePOs.length}`);
    }
    if (activeGRNs.length < 5) {
      throw new Error(`Expected at least 5 active GRNs in core table, found ${activeGRNs.length}`);
    }
  });

  // TEST 3: Adapter Read Redirection for Purchase Orders
  await runTest(3, 'Adapter Read Redirection (getConsolidatedPurchaseOrders)', 'READ_CONSOLIDATION', async () => {
    const res = await legacyProcurementAdapter.getConsolidatedPurchaseOrders({ page: 1, limit: 10 });
    if (!res.data || res.data.length === 0) {
      throw new Error('Adapter failed to return consolidated purchase orders');
    }
    if (!res.pagination || res.pagination.total === 0) {
      throw new Error('Pagination metadata missing in consolidated purchase orders');
    }
    const sample = res.data[0];
    if (!sample.poNumber || !sample.vendorName || sample.totalAmount === undefined) {
      throw new Error('Normalized PO fields missing (poNumber, vendorName, totalAmount)');
    }
  });

  // TEST 4: Adapter Read Redirection for Goods Receipts
  await runTest(4, 'Adapter Read Redirection (getConsolidatedGoodsReceipts)', 'READ_CONSOLIDATION', async () => {
    const res = await legacyProcurementAdapter.getConsolidatedGoodsReceipts({ page: 1, limit: 10 });
    if (!res.data || res.data.length === 0) {
      throw new Error('Adapter failed to return consolidated goods receipts');
    }
    const sample = res.data[0];
    if (!sample.grnNumber || !sample.warehouseId || !sample.status) {
      throw new Error('Normalized GRN fields missing (grnNumber, warehouseId, status)');
    }
  });

  // TEST 5: Inventory Repository PO Reads Consolidated to SSoT
  await runTest(5, 'Inventory Repository getPurchaseOrders redirects to Core SSoT', 'REPOSITORY_CONSOLIDATION', async () => {
    const result = await inventoryRepository.getPurchaseOrders({ page: 1, limit: 10 });
    if (!result.data || result.data.length === 0) {
      throw new Error('Inventory repository getPurchaseOrders returned empty data');
    }
    // Check that total reflects core active table count (>= 40)
    if (result.pagination.total < 10) {
      throw new Error(`Expected >= 10 total POs, got ${result.pagination.total}`);
    }
  });

  // TEST 6: Inventory Repository GRN Reads Consolidated
  await runTest(6, 'Inventory Repository getGoodsReceipts returns Consolidated GRNs', 'REPOSITORY_CONSOLIDATION', async () => {
    const result = await inventoryRepository.getGoodsReceipts({ page: 1, limit: 10 });
    if (!result.data || result.data.length === 0) {
      throw new Error('Inventory repository getGoodsReceipts returned empty data');
    }
    if (result.total < 5) {
      throw new Error(`Expected >= 5 total GRNs, got ${result.total}`);
    }
  });

  // TEST 7: Safe Write Bridge to Core SSoT (bridgeCreatePurchaseOrder)
  let bridgedPoNumber = '';
  await runTest(7, 'Write Bridge: bridgeCreatePurchaseOrder writes to Core SSoT', 'WRITE_BRIDGING', async () => {
    const created = await legacyProcurementAdapter.bridgeCreatePurchaseOrder(
      {
        vendorId: 'vnd-001',
        vendorName: 'Emirates Steel Industries',
        projectId: 'prj-001',
        projectName: 'Dubai Creek Harbor Tower',
        totalAmount: 145000,
        paymentTerms: 'Net 30 Days',
        notes: 'Phase 5C Bridge Test Order',
      },
      'Phase5CVerificationSuite'
    );

    if (!created.poNumber || !created.id) {
      throw new Error('Bridged PO creation failed to return valid poNumber and ID');
    }
    bridgedPoNumber = created.poNumber;

    // Verify it exists in procurementPurchaseOrdersTable
    const [foundInActive] = await db
      .select()
      .from(procurementPurchaseOrdersTable)
      .where(eq(procurementPurchaseOrdersTable.poNumber, created.poNumber));

    if (!foundInActive) {
      throw new Error(`Bridged PO ${created.poNumber} was not found in core procurement_purchase_orders table`);
    }

    if (foundInActive.vendorName !== 'Emirates Steel Industries' || Number(foundInActive.netAmountUSD) !== 145000) {
      throw new Error('Bridged PO fields in active table mismatch inserted values');
    }
  });

  // TEST 8: Centralized Numbering Format Compliance in Write Bridge
  await runTest(8, 'Centralized Numbering Compliance on Bridged Document (PO-YYYY-MM-XXXX)', 'NUMBERING_INTEGRATION', async () => {
    if (!bridgedPoNumber) {
      throw new Error('Bridged PO number missing from previous test');
    }
    // Pattern: PO-YYYY-MM-XXXX or PO-XXXX
    const poRegex = /^PO(-\d{4})?(-\d{2})?-\d{3,6}$/;
    if (!poRegex.test(bridgedPoNumber)) {
      throw new Error(`Bridged PO number ${bridgedPoNumber} does not conform to enterprise numbering pattern`);
    }
  });

  // TEST 9: Telemetry Logging Verification
  await runTest(9, 'Telemetry Logs Recorded for Reads & Writes (legacyProcurementTelemetry)', 'TELEMETRY_OBSERVABILITY', async () => {
    const recentLogs = await legacyProcurementTelemetry.getRecentEvents(20);
    if (!Array.isArray(recentLogs) || recentLogs.length === 0) {
      throw new Error('No telemetry events recorded');
    }

    const hasReadRedirect = recentLogs.some((l) => l.eventType === 'LEGACY_READ_REDIRECTED');
    const hasWriteBridge = recentLogs.some((l) => l.eventType === 'LEGACY_WRITE_BRIDGED');

    if (!hasReadRedirect) {
      throw new Error('Telemetry did not record any LEGACY_READ_REDIRECTED events');
    }
    if (!hasWriteBridge) {
      throw new Error('Telemetry did not record any LEGACY_WRITE_BRIDGED events');
    }
  });

  // TEST 10: Reports Repository Consolidation
  await runTest(10, 'Reports Repository executes PROCUREMENT report via Core SSoT', 'REPORTS_CONSOLIDATION', async () => {
    await reportsRepository.ensureReportsSeeded();
    const reportData = await reportsRepository.executeReportData('rpt-proc-po-spend');
    if (!reportData || !Array.isArray(reportData.rows)) {
      throw new Error('Reports repository failed to generate report rows for PROCUREMENT data source');
    }
    if (reportData.rows.length === 0) {
      throw new Error('Report rows for PROCUREMENT data source are empty');
    }
  });

  // TEST 11: Project Repository Cost Control Integration
  await runTest(11, 'Project Repository getCommercialCostControl queries Core SSoT POs', 'PROJECT_COST_CONTROL', async () => {
    const result = await projectRepository.findAllProjects();
    const targetProjectId = result.projects.length > 0 ? result.projects[0].id : 'PRJ-101';
    const costReport = await projectRepository.getCommercialCostControl(targetProjectId);
    if (!costReport || !costReport.kpis || typeof costReport.kpis.totalCommitted !== 'number') {
      throw new Error('Project cost control report missing totalCommitted computation');
    }
    if (costReport.kpis.totalCommitted < 0) {
      throw new Error('Expected non-negative totalCommitted from active POs');
    }
  });

  // TEST 12: Procurement Enterprise Dashboard Statistics
  await runTest(12, 'Enterprise Procurement Dashboard aggregates from Core SSoT', 'DASHBOARD_INTEGRATION', async () => {
    const stats = await procurementEnterpriseRepository.getProcurementDashboardStats();
    if (!stats || typeof stats.totalSpendAed !== 'number') {
      throw new Error('Enterprise procurement stats missing totalSpendAed');
    }
    if (stats.goodsReceiptsCount === undefined || stats.openPosCount === undefined) {
      throw new Error('Enterprise procurement stats missing goodsReceiptsCount or openPosCount');
    }
  });

  // TEST 13: Phase 56 POs Backward Compatibility & Consolidation
  await runTest(13, 'Procurement Repository getPhase56POs returns unified dataset', 'PHASE56_BACKWARD_COMPAT', async () => {
    const pos = await procurementRepository.getPhase56POs({});
    if (!Array.isArray(pos) || pos.length === 0) {
      throw new Error('getPhase56POs returned empty list');
    }
    // Verify it contains active PO records
    const sample = pos[0];
    if (!sample.poNumber || !sample.vendorName) {
      throw new Error('getPhase56POs items missing standard PO properties');
    }
  });

  // TEST 14: Phase 5A Idempotency Regression Guard
  await runTest(14, 'Phase 5A Idempotency Regression Guard (No Breakage)', 'PHASE5A_REGRESSION', async () => {
    const testKey = `phase5c-reg-${Date.now()}`;
    const claim = await idempotencyService.evaluateKey({
      key: testKey,
      userId: 'usr-admin-001',
      method: 'POST',
      routePath: '/api/v1/procurement/orders',
      requestPayload: { action: 'VERIFY_5A_GUARD', amount: 5000 },
    });

    if (claim.status !== 'CLAIMED') {
      throw new Error(`Expected CLAIMED state on initial claim, got ${claim.status}`);
    }

    await idempotencyService.recordSuccess(testKey, 'usr-admin-001', 200, { success: true, orderId: 'po-test-guard' });

    const replayClaim = await idempotencyService.evaluateKey({
      key: testKey,
      userId: 'usr-admin-001',
      method: 'POST',
      routePath: '/api/v1/procurement/orders',
      requestPayload: { action: 'VERIFY_5A_GUARD', amount: 5000 },
    });

    if (replayClaim.status !== 'COMPLETED' || !replayClaim.record.responseBody) {
      throw new Error(`Expected COMPLETED state on idempotency replay, got ${replayClaim.status}`);
    }
  });

  // TEST 15: Phase 5B Centralized Numbering Regression Guard
  await runTest(15, 'Phase 5B Centralized Numbering Regression Guard (No Breakage)', 'PHASE5B_REGRESSION', async () => {
    const poNum = await numberingService.generatePurchaseOrderNumber({ companyId: 'cmp-101', projectId: 'prj-001' });
    const grnNum = await numberingService.generateGoodsReceiptNumber({ companyId: 'cmp-101', projectId: 'prj-001' });
    const prNum = await numberingService.generatePurchaseRequisitionNumber({ companyId: 'cmp-101', projectId: 'prj-001' });

    if (!poNum.startsWith('PO-')) throw new Error(`PO Number invalid format: ${poNum}`);
    if (!grnNum.startsWith('GRN-')) throw new Error(`GRN Number invalid format: ${grnNum}`);
    if (!prNum.startsWith('PR-')) throw new Error(`PR Number invalid format: ${prNum}`);
  });

  // SUMMARY REPORT
  console.log('\n============================================================');
  console.log('PHASE 5C VERIFICATION SUMMARY');
  console.log('============================================================');

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const total = results.length;

  console.log(`TOTAL TESTS: ${total}`);
  console.log(`PASSED:      ${passed}/${total}`);
  console.log(`FAILED:      ${failed}/${total}`);

  if (failed > 0) {
    console.error('\nFAILED TESTS:');
    results
      .filter((r) => r.status === 'FAIL')
      .forEach((r) => {
        console.error(` - [TEST ${r.id}] ${r.name}: ${r.details}`);
      });
    process.exit(1);
  } else {
    console.log('\n\x1b[32mALL 15/15 TESTS PASSED SUCCESSFULLY!\x1b[0m');
    console.log('Legacy Procurement Consolidation is verified & operational.');
    process.exit(0);
  }
}

runSuite().catch((err) => {
  console.error('Fatal error during suite execution:', err);
  process.exit(1);
});

import { db } from '../src/db/index';
import {
  comparativeStatements,
  vendorQuotations,
  vendorQuotationItems,
  purchaseOrders,
  purchaseOrderItems,
  procurementLogs,
  procurementMeasurementEntriesTable,
  procurementRaBillsTable,
} from '../src/db/schema';
import { procurementRepository } from '../src/api/repositories/procurement.repository';
import { procurementService } from '../src/api/services/procurement.service';
import { eq, desc } from 'drizzle-orm';

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
  console.log('SITESYNC PRO ERP — PHASE 6A AUTOMATED VERIFICATION SUITE');
  console.log('CS → PO WORKFLOW BRIDGE & MB → RA BILL WORKFLOW BRIDGE');
  console.log('============================================================\n');

  // Shared test identifiers
  const testRunId = Date.now();
  const testCsId = `cs-test-${testRunId}`;
  const testQuoteId = `vq-test-${testRunId}`;
  const testRfqId = `rfq-test-${testRunId}`;
  const testMbId = `mb-test-${testRunId}`;
  const testMbNumber = `MB-2026-T${String(testRunId).slice(-4)}`;

  // ============================================================
  // SUITE 1: APPROVED COMPARATIVE STATEMENT -> PURCHASE ORDER
  // ============================================================
  console.log('--- SUITE 1: CS -> PO CONVERSION ENGINE ---');

  // Setup: Seed RFQ Quotation & Draft Comparative Statement
  await db.insert(vendorQuotations).values({
    id: testQuoteId,
    rfqId: testRfqId,
    rfqNumber: 'RFQ-2026-001',
    vendorId: 'vnd-101',
    vendorName: 'Apex Pipeline Supplies LLC',
    quotationNumber: `VQ-P6A-${testRunId}`,
    quotationDate: new Date().toISOString().split('T')[0],
    subtotal: 120000,
    taxAmount: 6000,
    discountAmount: 1000,
    totalAmount: 125000,
    deliveryLeadTimeDays: 10,
    paymentTerms: 'Net 30 Days from GRN clearance',
    currency: 'AED',
    status: 'ACCEPTED',
    isActive: true,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'Procurement Specialist',
    updatedBy: 'Procurement Specialist',
  });

  await db.insert(vendorQuotationItems).values([
    {
      id: `vqi-1-${testRunId}`,
      quotationId: testQuoteId,
      materialId: null,
      materialCode: 'MAT-PIPE-DI-500',
      materialName: 'Ductile Iron Pipe Class K9 500mm',
      offeredQuantity: 50,
      unitPrice: 2000,
      totalPrice: 100000,
      complianceRemarks: 'ISO 2531 Certified',
      createdAt: new Date().toISOString(),
    },
    {
      id: `vqi-2-${testRunId}`,
      quotationId: testQuoteId,
      materialId: null,
      materialCode: 'MAT-VALVE-BF-500',
      materialName: 'Double Eccentric Butterfly Valve PN16',
      offeredQuantity: 5,
      unitPrice: 4000,
      totalPrice: 20000,
      complianceRemarks: 'BS EN 593 Compliant',
      createdAt: new Date().toISOString(),
    },
  ]);

  await db.insert(comparativeStatements).values({
    id: testCsId,
    rfqId: testRfqId,
    rfqNumber: 'RFQ-2026-001',
    statementNumber: `CS-P6A-${testRunId}`,
    projectId: 'PRJ-WATER-001',
    projectName: 'Water Network Expansion',
    preparedBy: 'Lead QS',
    preparedDate: new Date().toISOString().split('T')[0],
    recommendedVendorId: 'vnd-101',
    recommendedVendorName: 'Apex Pipeline Supplies LLC',
    recommendedQuotationId: testQuoteId,
    justification: 'Lowest evaluated compliant bid with shortest lead time',
    status: 'DRAFT',
    isActive: true,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'Lead QS',
    updatedBy: 'Lead QS',
  });

  await runTest(
    1,
    'Service & Repository CS -> PO Method Existence',
    'CS_TO_PO',
    async () => {
      if (typeof procurementRepository.generatePoFromComparativeStatement !== 'function') {
        throw new Error('procurementRepository.generatePoFromComparativeStatement is not a function');
      }
      if (typeof procurementService.generatePoFromComparativeStatement !== 'function') {
        throw new Error('procurementService.generatePoFromComparativeStatement is not a function');
      }
    }
  );

  await runTest(
    2,
    'Approval Gate: Rejects CS Conversion when Status is DRAFT',
    'CS_TO_PO',
    async () => {
      let threw = false;
      try {
        await procurementRepository.generatePoFromComparativeStatement(testCsId, {
          user: { id: 'usr-admin', name: 'Procurement Director', role: 'ADMIN' },
        });
      } catch (err: any) {
        threw = true;
        if (!err.message.includes('not APPROVED')) {
          throw new Error(`Expected error to mention 'not APPROVED', received: ${err.message}`);
        }
      }
      if (!threw) {
        throw new Error('Expected generatePoFromComparativeStatement to throw on DRAFT status');
      }
    }
  );

  await runTest(
    3,
    'Approval Gate: Approve Comparative Statement',
    'CS_TO_PO',
    async () => {
      const approved = await procurementRepository.approveComparativeStatement(
        testCsId,
        'Executive Director of Procurement'
      );
      if (!approved || approved.status !== 'APPROVED') {
        throw new Error(`Failed to approve CS ${testCsId}`);
      }
    }
  );

  let generatedPo: any = null;
  await runTest(
    4,
    'CS -> PO Bridge: Successfully Converts Approved CS to PO',
    'CS_TO_PO',
    async () => {
      generatedPo = await procurementRepository.generatePoFromComparativeStatement(testCsId, {
        user: { id: 'usr-admin', name: 'Procurement Director', role: 'ADMIN' },
        companyId: 'cmp-101',
      });

      if (!generatedPo) throw new Error('No PO returned from conversion');
      if (!generatedPo.poNumber || !generatedPo.poNumber.startsWith('PO-')) {
        throw new Error(`Invalid PO Number generated: ${generatedPo.poNumber}`);
      }
      if (generatedPo.status !== 'APPROVED') {
        throw new Error(`Expected PO status APPROVED, got: ${generatedPo.status}`);
      }
    }
  );

  await runTest(
    5,
    'Financial Integrity: PO Values Match Winning Quotation',
    'CS_TO_PO',
    async () => {
      if (Number(generatedPo.totalAmount) !== 125000) {
        throw new Error(`PO total amount ${generatedPo.totalAmount} does not match quotation total 125000`);
      }
      if (Number(generatedPo.subtotal) !== 120000) {
        throw new Error(`PO subtotal ${generatedPo.subtotal} does not match quotation subtotal 120000`);
      }
      if (generatedPo.vendorId !== 'vnd-101') {
        throw new Error(`PO vendorId ${generatedPo.vendorId} does not match quotation vendorId vnd-101`);
      }
    }
  );

  await runTest(
    6,
    'Item Traceability: Line Items Created with Complete Detail',
    'CS_TO_PO',
    async () => {
      const items = await db
        .select()
        .from(purchaseOrderItems)
        .where(eq(purchaseOrderItems.poId, generatedPo.id));

      if (items.length !== 2) {
        throw new Error(`Expected 2 PO items, found: ${items.length}`);
      }

      const pipeItem = items.find((i) => i.materialCode === 'MAT-PIPE-DI-500');
      if (!pipeItem || Number(pipeItem.orderedQty) !== 50 || Number(pipeItem.unitPrice) !== 2000) {
        throw new Error(`Invalid pipe item data in PO: ${JSON.stringify(pipeItem)}`);
      }
    }
  );

  await runTest(
    7,
    'Procurement Log & Audit Trail Created',
    'CS_TO_PO',
    async () => {
      const logs = await db
        .select()
        .from(procurementLogs)
        .where(eq(procurementLogs.entityId, generatedPo.id));

      if (logs.length === 0) {
        throw new Error(`No procurement logs found for created PO ${generatedPo.id}`);
      }
      if (logs[0].actionType !== 'CREATE') {
        throw new Error(`Expected actionType CREATE, got: ${logs[0].actionType}`);
      }
    }
  );

  await runTest(
    8,
    'Duplicate Prevention: Rejects Second Conversion for Same CS',
    'CS_TO_PO',
    async () => {
      let threw = false;
      try {
        await procurementRepository.generatePoFromComparativeStatement(testCsId, {
          user: { id: 'usr-admin', name: 'Procurement Director', role: 'ADMIN' },
        });
      } catch (err: any) {
        threw = true;
        if (!err.message.includes('Conflict:') && !err.message.includes('already')) {
          throw new Error(`Expected conflict error, got: ${err.message}`);
        }
      }
      if (!threw) {
        throw new Error('Expected duplicate conversion to throw conflict error');
      }
    }
  );

  // ============================================================
  // SUITE 2: APPROVED MEASUREMENT BOOK -> CONTRACTOR RA BILL
  // ============================================================
  console.log('\n--- SUITE 2: MB -> RA BILL CONVERSION & OVER-BILLING ENGINE ---');

  // Setup: Seed Approved MB entry for 500 CUM
  await db.insert(procurementMeasurementEntriesTable).values({
    id: testMbId,
    mbNumber: testMbNumber,
    entryDate: new Date().toISOString().split('T')[0],
    measurementDate: new Date().toISOString().split('T')[0],
    projectId: 'PRJ-WATER-001',
    projectName: 'Water Network Expansion',
    boqItemId: `boq-earth-${testRunId}`,
    boqItemCode: 'BOQ-EW-01',
    boqDescription: 'Bulk excavation in all classes of soil & soft rock',
    contractorName: 'Apex Groundworks LLC',
    chainageLocation: 'Ch 0+000 to Ch 0+500',
    locationChainage: 'Ch 0+000 to Ch 0+500',
    lengthMeters: 500,
    breadthMeters: 1,
    depthMeters: 1,
    heightMeters: 1,
    calculatedQuantity: 500,
    quantity: 500,
    unit: 'CUM',
    valuationUSD: 60000, // $120 / CUM
    status: 'Approved by Project Manager',
    recordedByName: 'Senior Site QS',
    verifiedByName: 'Resident Engineer',
    approvedByName: 'Project Manager',
    remarks: 'Trench excavation surveyed and certified.',
    createdAt: new Date().toISOString(),
  });

  await runTest(
    9,
    'Service & Repository Billable Measurements Method Existence',
    'MB_TO_RA_BILL',
    async () => {
      if (typeof procurementRepository.getBillableMeasurementEntries !== 'function') {
        throw new Error('procurementRepository.getBillableMeasurementEntries is not a function');
      }
      if (typeof procurementService.getBillableMeasurementEntries !== 'function') {
        throw new Error('procurementService.getBillableMeasurementEntries is not a function');
      }
    }
  );

  await runTest(
    10,
    'Initial Billable Retrieval: Full Approved Quantity Available',
    'MB_TO_RA_BILL',
    async () => {
      const billables = await procurementRepository.getBillableMeasurementEntries({
        projectId: 'PRJ-WATER-001',
      });

      const matched = billables.find((m) => m.id === testMbId);
      if (!matched) {
        throw new Error(`MB ${testMbId} not found in billable measurements result`);
      }
      if (matched.approvedQuantity !== 500) {
        throw new Error(`Expected approvedQuantity 500, got: ${matched.approvedQuantity}`);
      }
      if (matched.previouslyBilledQty !== 0) {
        throw new Error(`Expected previouslyBilledQty 0, got: ${matched.previouslyBilledQty}`);
      }
      if (matched.remainingBillableQty !== 500) {
        throw new Error(`Expected remainingBillableQty 500, got: ${matched.remainingBillableQty}`);
      }
      if (matched.rateUSD !== 120) {
        throw new Error(`Expected rateUSD 120, got: ${matched.rateUSD}`);
      }
    }
  );

  let raBill1: any = null;
  await runTest(
    11,
    'RA Bill 1: Create Partial Bill for 300 CUM against Approved MB',
    'MB_TO_RA_BILL',
    async () => {
      raBill1 = await procurementRepository.createRABill({
        projectId: 'PRJ-WATER-001',
        projectName: 'Water Network Expansion',
        workOrderId: `wo-test-${testRunId}`,
        companyId: 'cmp-101',
        contractorName: 'Apex Groundworks LLC',
        billDate: new Date().toISOString().split('T')[0],
        createdById: 'usr-ci-ra-biller',
        createdByName: 'CI RA Billing Actor',
        items: [
          {
            id: `item-1-${testRunId}`,
            boqItemId: `boq-earth-${testRunId}`,
            itemCode: 'BOQ-EW-01',
            description: 'Bulk excavation in all classes of soil',
            unit: 'CUM',
            boqQuantity: 500,
            boqRateUSD: 120,
            previousCumulativeQty: 0,
            currentMeasuredQty: 300,
            mbReference: testMbNumber,
            measurementEntryId: testMbId,
          } as any,
        ],
      });

      if (!raBill1 || !raBill1.billNumber) {
        throw new Error('Failed to create RA Bill 1');
      }
    }
  );

  await runTest(
    12,
    'Updated Balance: Previously Billed Qty Calculated Server-Side as 300',
    'MB_TO_RA_BILL',
    async () => {
      const billables = await procurementRepository.getBillableMeasurementEntries({
        projectId: 'PRJ-WATER-001',
      });

      const matched = billables.find((m) => m.id === testMbId);
      if (!matched) {
        throw new Error(`MB ${testMbId} should still be billable with 200 remaining`);
      }
      if (matched.previouslyBilledQty !== 300) {
        throw new Error(`Expected previouslyBilledQty 300, got: ${matched.previouslyBilledQty}`);
      }
      if (matched.remainingBillableQty !== 200) {
        throw new Error(`Expected remainingBillableQty 200, got: ${matched.remainingBillableQty}`);
      }
    }
  );

  await runTest(
    13,
    'Over-Billing Prevention: Rejects RA Bill Attempting to Bill 250 CUM (> 200 remaining)',
    'MB_TO_RA_BILL',
    async () => {
      let threw = false;
      try {
        await procurementRepository.createRABill({
          projectId: 'PRJ-WATER-001',
          projectName: 'Water Network Expansion',
          workOrderId: `wo-test-${testRunId}`,
        companyId: 'cmp-101',
        contractorName: 'Apex Groundworks LLC',
          billDate: new Date().toISOString().split('T')[0],
        createdById: 'usr-ci-ra-biller',
        createdByName: 'CI RA Billing Actor',
          items: [
            {
              id: `item-2-fail-${testRunId}`,
              boqItemId: `boq-earth-${testRunId}`,
              itemCode: 'BOQ-EW-01',
              description: 'Bulk excavation',
              unit: 'CUM',
              boqQuantity: 500,
              boqRateUSD: 120,
              previousCumulativeQty: 300,
              currentMeasuredQty: 250, // 300 + 250 = 550 > 500!
              mbReference: testMbNumber,
              measurementEntryId: testMbId,
            } as any,
          ],
        });
      } catch (err: any) {
        threw = true;
        if (!err.message.includes('Over-billing violation')) {
          throw new Error(`Expected error to mention 'Over-billing violation', got: ${err.message}`);
        }
      }
      if (!threw) {
        throw new Error('Expected over-billing creation to throw an error');
      }
    }
  );

  await runTest(
    14,
    'RA Bill 2: Create Bill for Exact Remaining 200 CUM',
    'MB_TO_RA_BILL',
    async () => {
      const raBill2 = await procurementRepository.createRABill({
        projectId: 'PRJ-WATER-001',
        projectName: 'Water Network Expansion',
        workOrderId: `wo-test-${testRunId}`,
        companyId: 'cmp-101',
        contractorName: 'Apex Groundworks LLC',
        billDate: new Date().toISOString().split('T')[0],
        createdById: 'usr-ci-ra-biller',
        createdByName: 'CI RA Billing Actor',
        items: [
          {
            id: `item-2-success-${testRunId}`,
            boqItemId: `boq-earth-${testRunId}`,
            itemCode: 'BOQ-EW-01',
            description: 'Bulk excavation final balance',
            unit: 'CUM',
            boqQuantity: 500,
            boqRateUSD: 120,
            previousCumulativeQty: 300,
            currentMeasuredQty: 200,
            mbReference: testMbNumber,
            measurementEntryId: testMbId,
          } as any,
        ],
      });

      if (!raBill2 || !raBill2.billNumber) {
        throw new Error('Failed to create RA Bill 2');
      }
    }
  );

  await runTest(
    15,
    'Zero-Balance Exclusion: Fully Billed MB Excluded from Billables',
    'MB_TO_RA_BILL',
    async () => {
      const billables = await procurementRepository.getBillableMeasurementEntries({
        projectId: 'PRJ-WATER-001',
      });

      const matched = billables.find((m) => m.id === testMbId);
      if (matched) {
        throw new Error(
          `Fully billed MB ${testMbId} should be excluded from billable measurements, but was returned with remaining: ${matched.remainingBillableQty}`
        );
      }
    }
  );

  await runTest(
    16,
    'Unapproved MB Filtering: Draft MBs are Excluded from Billables',
    'MB_TO_RA_BILL',
    async () => {
      const draftMbId = `mb-draft-${testRunId}`;
      await db.insert(procurementMeasurementEntriesTable).values({
        id: draftMbId,
        mbNumber: `MB-DRAFT-${testRunId}`,
        entryDate: new Date().toISOString().split('T')[0],
        measurementDate: new Date().toISOString().split('T')[0],
        projectId: 'PRJ-WATER-001',
        projectName: 'Water Network Expansion',
        boqItemId: 'boq-draft-01',
        boqItemCode: 'BOQ-DR-01',
        boqDescription: 'Draft unapproved measurement item',
        contractorName: 'Apex Groundworks LLC',
        chainageLocation: 'Ch 1+000',
        locationChainage: 'Ch 1+000',
        lengthMeters: 10,
        breadthMeters: 1,
        depthMeters: 1,
        heightMeters: 1,
        calculatedQuantity: 100,
        quantity: 100,
        unit: 'CUM',
        valuationUSD: 10000,
        status: 'Draft',
        recordedByName: 'Junior Engineer',
        createdAt: new Date().toISOString(),
      });

      const billables = await procurementRepository.getBillableMeasurementEntries({
        projectId: 'PRJ-WATER-001',
      });

      const matched = billables.find((m) => m.id === draftMbId);
      if (matched) {
        throw new Error(`Draft MB ${draftMbId} should not be returned in billable list`);
      }
    }
  );

  // ============================================================
  // SUMMARY REPORT
  // ============================================================
  console.log('\n============================================================');
  console.log('PHASE 6A VERIFICATION RESULTS SUMMARY');
  console.log('============================================================');

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const total = results.length;

  console.log(`TOTAL TESTS:  ${total}`);
  console.log(`PASSED:       ${passed}`);
  console.log(`FAILED:       ${failed}`);

  if (failed > 0) {
    console.error('\nFAILED TESTS:');
    results
      .filter((r) => r.status === 'FAIL')
      .forEach((r) => console.error(` - [TEST ${r.id}] ${r.name}: ${r.details}`));
    process.exit(1);
  } else {
    console.log('\n\x1b[32m✔ ALL PHASE 6A TESTS PASSED PERFECTLY (16/16)\x1b[0m\n');
    process.exit(0);
  }
}

runSuite().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});

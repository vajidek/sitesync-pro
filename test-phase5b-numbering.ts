import { numberingService } from './src/api/services/numbering.service';
import { numberingRepository } from './src/api/repositories/numbering.repository';
import { inventoryRepository } from './src/api/repositories/inventory.repository';
import { procurementRepository } from './src/api/repositories/procurement.repository';
import { projectCashRequestRepository } from './src/api/repositories/projectCashRequest.repository';
import { db, createPool } from './src/db';
import { sql } from 'drizzle-orm';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, details?: string) {
  if (condition) {
    results.push({ name, passed: true, details });
    console.log(`✅ PASS: ${name}${details ? ` (${details})` : ''}`);
  } else {
    results.push({ name, passed: false, details, error: 'Assertion failed' });
    console.error(`❌ FAIL: ${name}${details ? ` (${details})` : ''}`);
  }
}

async function runTests() {
  console.log('============================================================');
  console.log('PHASE 5B — CENTRALIZED DOCUMENT NUMBERING ENGINE VERIFICATION');
  console.log('============================================================\n');

  // Test 1: Single PO Allocation & Format
  try {
    const poNum = await numberingService.generatePurchaseOrderNumber({
      companyId: 'cmp-t1',
      date: '2026-04-15',
    });
    assert(
      poNum.startsWith('PO-2026-'),
      'Test 1: Single PO Allocation Format',
      `Allocated: ${poNum}`
    );
  } catch (err: any) {
    assert(false, 'Test 1: Single PO Allocation Format', err.message);
  }

  // Test 2: Concurrency Stress Test — 20 Concurrent PO Allocations
  try {
    const promises = Array.from({ length: 20 }, () =>
      numberingService.generatePurchaseOrderNumber({ companyId: 'cmp-concur-po' })
    );
    const poList = await Promise.all(promises);
    const unique = new Set(poList);
    assert(
      unique.size === 20,
      'Test 2: 20 Concurrent PO Requests — Zero Duplicate Guarantee',
      `Generated ${unique.size}/20 unique PO numbers under race condition: [${poList.slice(0, 3).join(', ')} ...]`
    );
  } catch (err: any) {
    assert(false, 'Test 2: 20 Concurrent PO Requests', err.message);
  }

  // Test 3: Concurrency Stress Test — 20 Concurrent GRN Allocations
  try {
    const promises = Array.from({ length: 20 }, () =>
      numberingService.generateGoodsReceiptNumber({ companyId: 'cmp-concur-grn' })
    );
    const grnList = await Promise.all(promises);
    const unique = new Set(grnList);
    assert(
      unique.size === 20,
      'Test 3: 20 Concurrent GRN Requests — Zero Duplicate Guarantee',
      `Generated ${unique.size}/20 unique GRN numbers under race condition`
    );
  } catch (err: any) {
    assert(false, 'Test 3: 20 Concurrent GRN Requests', err.message);
  }

  // Test 4: Concurrency Stress Test — 20 Concurrent Material Issue (MIV) Allocations
  try {
    const promises = Array.from({ length: 20 }, () =>
      numberingService.generateMaterialIssueNumber({ companyId: 'cmp-concur-miv' })
    );
    const mivList = await Promise.all(promises);
    const unique = new Set(mivList);
    assert(
      unique.size === 20,
      'Test 4: 20 Concurrent MIV Requests — Zero Duplicate Guarantee',
      `Generated ${unique.size}/20 unique MIV numbers under race condition`
    );
  } catch (err: any) {
    assert(false, 'Test 4: 20 Concurrent MIV Requests', err.message);
  }

  // Test 5: Concurrency Stress Test — 20 Concurrent Material Return (RET) Allocations
  try {
    const promises = Array.from({ length: 20 }, () =>
      numberingService.generateMaterialReturnNumber({ companyId: 'cmp-concur-ret' })
    );
    const retList = await Promise.all(promises);
    const unique = new Set(retList);
    assert(
      unique.size === 20,
      'Test 5: 20 Concurrent RET Requests — Zero Duplicate Guarantee',
      `Generated ${unique.size}/20 unique RET numbers under race condition`
    );
  } catch (err: any) {
    assert(false, 'Test 5: 20 Concurrent RET Requests', err.message);
  }

  // Test 6: Concurrency Stress Test — 20 Concurrent Material Transfer (TRF) Allocations
  try {
    const promises = Array.from({ length: 20 }, () =>
      numberingService.generateMaterialTransferNumber({ companyId: 'cmp-concur-trf' })
    );
    const trfList = await Promise.all(promises);
    const unique = new Set(trfList);
    assert(
      unique.size === 20,
      'Test 6: 20 Concurrent TRF Requests — Zero Duplicate Guarantee',
      `Generated ${unique.size}/20 unique TRF numbers under race condition`
    );
  } catch (err: any) {
    assert(false, 'Test 6: 20 Concurrent TRF Requests', err.message);
  }

  // Test 7: Non-Consuming Preview (Peek)
  try {
    const peek1 = await numberingService.peekNextNumber({
      entityType: 'PURCHASE_ORDER',
      companyId: 'cmp-peek-test',
    });
    const peek2 = await numberingService.peekNextNumber({
      entityType: 'PURCHASE_ORDER',
      companyId: 'cmp-peek-test',
    });
    const allocated = await numberingService.generatePurchaseOrderNumber({
      companyId: 'cmp-peek-test',
    });
    const peek3 = await numberingService.peekNextNumber({
      entityType: 'PURCHASE_ORDER',
      companyId: 'cmp-peek-test',
    });

    assert(
      peek1 === peek2 && peek1 === allocated && peek3 !== allocated,
      'Test 7: Non-Consuming Peek / Preview Verification',
      `Peek1: ${peek1}, Peek2: ${peek2}, Allocated: ${allocated}, Next Peek: ${peek3}`
    );
  } catch (err: any) {
    assert(false, 'Test 7: Non-Consuming Peek / Preview Verification', err.message);
  }

  // Test 8: Custom Numbering Policy Configuration
  try {
    const custCompId = `cmp-custom-policy-${Date.now()}`;
    await numberingService.configurePolicy({
      entityType: 'PURCHASE_ORDER',
      companyId: custCompId,
      formatPattern: 'PO/{PROJECT}/{FY}/{SEQ:6}',
      zeroPadLength: 6,
      scopeLevel: 'PROJECT',
      resetFrequency: 'YEARLY',
    } as any);

    const customNumber = await numberingService.generatePurchaseOrderNumber({
      companyId: custCompId,
      projectId: 'METRO4',
      date: '2026-05-10',
    });

    assert(
      customNumber === 'PO/METRO4/2026/000001',
      'Test 8: Custom Numbering Policy & Token Interpolation',
      `Expected PO/METRO4/2026/000001, got ${customNumber}`
    );
  } catch (err: any) {
    assert(false, 'Test 8: Custom Numbering Policy Configuration', err.message);
  }

  // Test 9: April-March Fiscal Year Format
  try {
    const fyCompId = `cmp-fy-test-${Date.now()}`;
    await numberingService.configurePolicy({
      entityType: 'GOODS_RECEIPT',
      companyId: fyCompId,
      formatPattern: 'GRN-{FY}-{SEQ:4}',
      fiscalYearFormat: 'YYYY-YY',
      startMonth: 4, // April
    } as any);

    // April 2026 -> 2026-27
    const grnApr = await numberingService.generateGoodsReceiptNumber({
      companyId: fyCompId,
      date: '2026-04-10',
    });

    // February 2026 -> 2025-26
    const grnFeb = await numberingService.generateGoodsReceiptNumber({
      companyId: fyCompId,
      date: '2026-02-10',
    });

    assert(
      grnApr.startsWith('GRN-2026-27-') && grnFeb.startsWith('GRN-2025-26-'),
      'Test 9: April-March Fiscal Year Resolution',
      `Apr Date: ${grnApr}, Feb Date: ${grnFeb}`
    );
  } catch (err: any) {
    assert(false, 'Test 9: April-March Fiscal Year Resolution', err.message);
  }

  // Test 10: Company Scope Isolation
  try {
    const idA = `cmp-alpha-${Date.now()}`;
    const idB = `cmp-beta-${Date.now()}`;
    const compA_1 = await numberingService.generatePurchaseOrderNumber({ companyId: idA });
    const compB_1 = await numberingService.generatePurchaseOrderNumber({ companyId: idB });
    const compA_2 = await numberingService.generatePurchaseOrderNumber({ companyId: idA });

    assert(
      compA_1 === 'PO-2026-0001' && compB_1 === 'PO-2026-0001' && compA_2 === 'PO-2026-0002',
      'Test 10: Multi-Tenant Company Scope Isolation',
      `Company Alpha: [${compA_1}, ${compA_2}], Company Beta: [${compB_1}]`
    );
  } catch (err: any) {
    assert(false, 'Test 10: Multi-Tenant Company Scope Isolation', err.message);
  }

  // Test 11: Transaction Boundary & Atomic Allocation
  try {
    const txCompId = `cmp-tx-test-${Date.now()}`;
    let allocatedInsideTx = '';
    await db.transaction(async (tx) => {
      allocatedInsideTx = await numberingService.generatePurchaseOrderNumber(
        { companyId: txCompId },
        tx
      );
    });

    const nextAfterCommit = await numberingService.generatePurchaseOrderNumber({
      companyId: txCompId,
    });

    assert(
      allocatedInsideTx === 'PO-2026-0001' && nextAfterCommit === 'PO-2026-0002',
      'Test 11: Transaction Boundary & Atomic Propagation',
      `Tx Alloc: ${allocatedInsideTx}, Post-Commit Alloc: ${nextAfterCommit}`
    );
  } catch (err: any) {
    assert(false, 'Test 11: Transaction Boundary & Atomic Propagation', err.message);
  }

  // Test 12: Integrated Inventory GRN Creation via Repository
  try {
    const warehouses = await inventoryRepository.getWarehouses();
    const testWh = warehouses[0] || { id: 'wh_01', name: 'Central Store' };
    const materials = await inventoryRepository.getMaterials();
    const testMat = materials[0] || { id: 'mat_01', name: 'Cement 53 Grade', itemCode: 'MAT-CEM-01' };

    const grn = await inventoryRepository.createGoodsReceipt({
      warehouseId: testWh.id,
      warehouseName: testWh.name,
      vendorName: 'UltraTech Cement Ltd',
      receivedDate: '2026-05-15',
      receivedBy: 'Inspector John',
      items: [
        {
          materialId: testMat.id,
          materialCode: (testMat as any).itemCode || (testMat as any).code || 'MAT-CEM-01',
          materialName: testMat.name,
          orderedQty: 50,
          receivedQty: 50,
          acceptedQty: 50,
          unitPrice: 10,
        },
      ],
    });

    assert(
      grn && grn.grnNumber && grn.grnNumber.startsWith('GRN-2026-'),
      'Test 12: Integrated Inventory GRN Repository Creation with Centralized Numbering',
      `Created GRN ID: ${grn.id}, GRN Number: ${grn.grnNumber}`
    );
  } catch (err: any) {
    assert(false, 'Test 12: Integrated Inventory GRN Repository Creation', err.message);
  }

  // Test 13: Integrated Inventory Material Issue (MIV) Creation via Repository
  try {
    const warehouses = await inventoryRepository.getWarehouses();
    const testWh = warehouses[0] || { id: 'wh_01', name: 'Central Store' };
    const materials = await inventoryRepository.getMaterials();
    const testMat = materials[0] || { id: 'mat_01', name: 'Cement 53 Grade', itemCode: 'MAT-CEM-01' };

    const miv = await inventoryRepository.createMaterialIssue({
      warehouseId: testWh.id,
      warehouseName: testWh.name,
      projectId: 'prj_01',
      projectName: 'Metro Line 4',
      issueDate: '2026-05-15',
      issuedBy: 'Store Supervisor',
      recipientName: 'Site Engineer Bob',
      department: 'Civil Structure',
      items: [
        {
          materialId: testMat.id,
          materialCode: (testMat as any).itemCode || (testMat as any).code || 'MAT-CEM-01',
          materialName: testMat.name,
          requestedQty: 10,
          issuedQty: 10,
          unitPrice: 10,
        },
      ],
    });

    assert(
      miv && miv.issueNumber && miv.issueNumber.startsWith('MIV-2026-'),
      'Test 13: Integrated Inventory MIV Repository Creation with Centralized Numbering',
      `Created MIV ID: ${miv.id}, Issue Number: ${miv.issueNumber}`
    );
  } catch (err: any) {
    assert(false, 'Test 13: Integrated Inventory MIV Repository Creation', err.message);
  }

  // Test 14: Integrated Procurement Purchase Order Creation via Repository
  try {
    const po = await procurementRepository.createPurchaseOrder({
      vendorId: 'vnd_01',
      vendorName: 'Larsen Steel Ltd',
      projectId: 'prj_01',
      projectName: 'Metro Line 4',
      items: [
        {
          id: 'item_01',
          itemCode: 'STL-TMT-12',
          description: 'TMT Steel Bar 12mm',
          orderedQuantity: 100,
          unitPriceUSD: 25,
          totalPriceUSD: 2500,
          receivedQuantity: 0,
          acceptedQuantity: 0,
          rejectedQuantity: 0,
          returnedQuantity: 0,
          balanceQuantity: 100,
        } as any,
      ],
    });

    assert(
      po && po.poNumber && po.poNumber.startsWith('PO-2026-'),
      'Test 14: Integrated Procurement PO Repository Creation with Centralized Numbering',
      `Created PO ID: ${po.id}, PO Number: ${po.poNumber}`
    );
  } catch (err: any) {
    assert(false, 'Test 14: Integrated Procurement PO Repository Creation', err.message);
  }

  // Test 15: Integrated Project Cash Request Creation via Repository
  try {
    const cashReq = await projectCashRequestRepository.create({
      projectId: 'prj_01',
      projectName: 'Metro Line 4',
      employeeId: 'emp_01',
      employeeName: 'Site Engineer Dave',
      amount: 5000,
      purpose: 'Emergency Site Consumables & Minor Freight',
      category: 'SITE_EXPENSES',
    });

    assert(
      cashReq && cashReq.requestCode && cashReq.requestCode.startsWith('CR-2026-'),
      'Test 15: Integrated Project Cash Request Creation with Centralized Numbering',
      `Created Cash Request ID: ${cashReq.id}, Request Code: ${cashReq.requestCode}`
    );
  } catch (err: any) {
    assert(false, 'Test 15: Integrated Project Cash Request Creation', err.message);
  }

  // Test 16: Integrated RA Bill Creation via Procurement Repository
  try {
    const raBill = await procurementRepository.createRABill({
      projectId: 'prj_01',
      projectName: 'Metro Line 4',
      contractorCode: 'vnd_01',
      contractorName: 'Larsen Steel Ltd',
      billDate: '2026-05-20',
      periodFrom: '2026-05-01',
      periodTo: '2026-05-15',
      items: [
        {
          id: 'item_ra_01',
          boqItemId: 'boq_01',
          itemCode: 'BOQ-STR-01',
          description: 'Reinforced Concrete Pier Pouring',
          unit: 'CUM',
          boqQuantity: 200,
          boqRateUSD: 150,
          previousCumulativeQty: 50,
          currentMeasuredQty: 20,
          totalCumulativeQty: 70,
          currentAmountUSD: 3000,
          cumulativeAmountUSD: 10500,
        } as any,
      ],
    } as any);

    assert(
      raBill && raBill.billNumber && raBill.billNumber.startsWith('RA-2026-'),
      'Test 16: Integrated RA Bill Creation with Centralized Numbering',
      `Created RA Bill ID: ${raBill.id}, Bill Number: ${raBill.billNumber}`
    );
  } catch (err: any) {
    assert(false, 'Test 16: Integrated RA Bill Creation', err.message);
  }

  // Test 17: Phase 5A Non-Regression (Idempotency + Numbering Compatibility)
  try {
    const { idempotencyService } = await import('./src/api/services/idempotency.service');
    const key = `test-idemp-num-${Date.now()}`;
    const claim = await idempotencyService.evaluateKey({
      key,
      routePath: '/api/procurement/purchase-orders',
      method: 'POST',
      requestPayload: { vendorId: 'vnd_idemp', netAmountUSD: 5000 },
      userId: 'usr-admin-01',
    });

    assert(
      claim.status === 'CLAIMED',
      'Test 17: Phase 5A Idempotency Claim Lock with Numbering Compatibility',
      `Claim Status: ${claim.status}`
    );

    const generatedPo = await numberingService.generatePurchaseOrderNumber({ companyId: 'cmp-idemp-compat' });
    await idempotencyService.recordSuccess(
      key,
      'usr-admin-01',
      201,
      { poNumber: generatedPo, status: 'CREATED' }
    );

    const replayed = await idempotencyService.evaluateKey({
      key,
      routePath: '/api/procurement/purchase-orders',
      method: 'POST',
      requestPayload: { vendorId: 'vnd_idemp', netAmountUSD: 5000 },
      userId: 'usr-admin-01',
    });

    assert(
      replayed.status === 'COMPLETED' && replayed.record?.responseBody?.poNumber === generatedPo,
      'Test 17B: Phase 5A Replay Returns Exact Allocated Number Without Re-allocating Sequence',
      `Replayed PO: ${replayed.record?.responseBody?.poNumber}`
    );
  } catch (err: any) {
    assert(false, 'Test 17: Phase 5A Non-Regression', err.message);
  }

  console.log('\n============================================================');
  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  console.log(`PHASE 5B TEST SUMMARY: ${passedCount}/${totalCount} TESTS PASSED`);
  console.log('============================================================\n');

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runTests()
  .then(() => {
    console.log('All Phase 5B verification tests finished successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Test execution error:', err);
    process.exit(1);
  });

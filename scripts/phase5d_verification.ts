import { db } from '../src/db/index';
import {
  enterpriseAuditRepository,
  AuditEventPayload,
} from '../src/api/repositories/enterprise_audit.repository';
import { enterpriseAuditService } from '../src/api/services/enterprise_audit.service';
import { universalWorkflowBindingService } from '../src/api/services/universal_workflow_binding.service';
import { workflowPolicyEngine } from '../src/api/services/workflowPolicyEngine.service';
import { workflowRepository } from '../src/api/repositories/workflow.repository';
import { inventoryRepository } from '../src/api/repositories/inventory.repository';
import { procurementRepository } from '../src/api/repositories/procurement.repository';
import { projectCashRequestRepository } from '../src/api/repositories/projectCashRequest.repository';
import {
  phase66WorkflowInstances,
  phase66WorkflowTasks,
  workflowHistory,
  auditLogs,
  procurementLogs,
  inventoryLogs,
  enterpriseAuditEvents,
} from '../src/db/schema';
import { eq, and, sql } from 'drizzle-orm';

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
  console.log('PHASE 5D: UNIVERSAL WORKFLOW BINDING & ENTERPRISE AUDIT');
  console.log('VERIFICATION TEST SUITE (22 TARGETED GOVERNANCE CHECKS)');
  console.log('============================================================\n');

  // Ensure tables and baseline seed
  await enterpriseAuditRepository.ensureTable();
  await workflowRepository.seedInitialWorkflowData();

  // ------------------------------------------------------------
  // SECTION 1: ENTERPRISE AUDIT EVENT CORE LAYER
  // ------------------------------------------------------------

  await runTest(
    1,
    'Enterprise Audit Event Schema & Table Initialization',
    'Audit Core',
    async () => {
      await enterpriseAuditRepository.ensureTable();
      const testId = `test-init-${Date.now()}`;
      const evt = await enterpriseAuditRepository.logEvent({
        id: testId,
        userName: 'Admin Auditor',
        userRole: 'SYSTEM_ADMIN',
        actionType: 'CREATE',
        entityType: 'SYSTEM_CONFIG',
        entityId: 'cfg-001',
        entityNumber: 'CONF-2026-001',
        fromState: 'NONE',
        toState: 'INITIALIZED',
        reason: 'Verification test initialization',
      });
      if (!evt || evt.id !== testId) {
        throw new Error('Failed to record initial enterprise audit event');
      }
    }
  );

  await runTest(
    2,
    'Enterprise Audit Event Immutability Enforcement (Append-Only)',
    'Audit Core',
    async () => {
      let updateBlocked = false;
      let deleteBlocked = false;

      try {
        await enterpriseAuditRepository.updateEvent();
      } catch (err: any) {
        if (err.message.includes('Immutability Violation')) {
          updateBlocked = true;
        }
      }

      try {
        await enterpriseAuditRepository.deleteEvent();
      } catch (err: any) {
        if (err.message.includes('Immutability Violation')) {
          deleteBlocked = true;
        }
      }

      if (!updateBlocked || !deleteBlocked) {
        throw new Error('Enterprise audit repository failed to strictly reject update/delete operations');
      }
    }
  );

  await runTest(
    3,
    'Audit Event Multi-Dimensional Querying & Filtering',
    'Audit Query',
    async () => {
      const uniqueEntityId = `entity-query-${Date.now()}`;
      await enterpriseAuditRepository.logEvent({
        userName: 'Lead QS',
        userRole: 'QUANTITY_SURVEYOR',
        actionType: 'VERIFY',
        entityType: 'MEASUREMENT_SHEET',
        entityId: uniqueEntityId,
        entityNumber: 'MS-2026-99',
        metadata: { depth: '12m', grid: 'A4' },
      });

      const { events, total } = await enterpriseAuditRepository.queryEvents({
        entityType: 'MEASUREMENT_SHEET',
        entityId: uniqueEntityId,
      });

      if (total === 0 || events[0].entityId !== uniqueEntityId) {
        throw new Error(`Failed to query event by entityType and entityId. Found ${total}`);
      }
    }
  );

  await runTest(
    4,
    'Audit Event Idempotency Key Tracking & Correlation',
    'Audit Core',
    async () => {
      const idempotencyKey = `idemp-corr-${Date.now()}`;
      const entityId = `obj-idemp-${Date.now()}`;

      await enterpriseAuditRepository.logEvent({
        userName: 'Procurement Officer',
        actionType: 'CREATE',
        entityType: 'PURCHASE_REQUISITION',
        entityId,
        idempotencyKey,
        diffJson: { initialRate: 500 },
      });

      const events = await enterpriseAuditRepository.getEventsByIdempotencyKey(idempotencyKey);
      if (events.length === 0 || events[0].idempotencyKey !== idempotencyKey) {
        throw new Error('Idempotency key correlation lookup failed');
      }
    }
  );

  // ------------------------------------------------------------
  // SECTION 2: LEGACY AUDIT DUAL-WRITING & MIRRORING
  // ------------------------------------------------------------

  await runTest(
    5,
    'Legacy Audit Dual-Writing: Workflow History to Enterprise Audit',
    'Dual Write',
    async () => {
      const entityId = `mat-req-${Date.now()}`;

      await workflowRepository.logAuditEvent({
        userId: 'usr-wf-1',
        userName: 'Workflow Actor',
        userRole: 'SITE_ENGINEER',
        actionType: 'APPROVE',
        entityType: 'MATERIAL_REQUEST',
        entityId,
        entityNumber: 'MR-2026-555',
        fromState: 'PENDING_APPROVAL',
        toState: 'APPROVED',
        reason: 'Verified on site',
      });

      const { events } = await enterpriseAuditRepository.queryEvents({
        entityType: 'MATERIAL_REQUEST',
        entityId,
      });

      if (events.length === 0) {
        throw new Error('Dual-write from workflow repository to enterprise_audit_events failed');
      }
      if (events[0].toState !== 'APPROVED') {
        throw new Error(`Dual-written event state mismatch: ${events[0].toState}`);
      }
    }
  );

  await runTest(
    6,
    'Enterprise Audit Service Domain Mirroring to Legacy Tables',
    'Dual Write',
    async () => {
      const entityId = `po-mirror-${Date.now()}`;
      const entityNumber = `PO-MIRROR-2026`;

      await enterpriseAuditService.recordDomainEvent({
        userName: 'Commercial Manager',
        userRole: 'PROCUREMENT_MANAGER',
        actionType: 'APPROVE',
        entityType: 'PURCHASE_ORDER',
        entityId,
        entityNumber,
        fromState: 'PENDING_APPROVAL',
        toState: 'APPROVED',
        metadata: { totalAmount: 75000 },
        reason: 'Authorized within spend threshold',
        mirrorToLegacy: true,
      });

      // Check enterprise audit events
      const { events } = await enterpriseAuditRepository.queryEvents({
        entityType: 'PURCHASE_ORDER',
        entityId,
      });
      if (events.length === 0) {
        throw new Error('Enterprise audit event was not recorded');
      }

      // Check procurement_logs legacy table
      const legacyLogs = await db
        .select()
        .from(procurementLogs)
        .where(eq(procurementLogs.entityId, entityId));

      if (legacyLogs.length === 0) {
        throw new Error('Mirroring to legacy procurement_logs failed');
      }
    }
  );

  // ------------------------------------------------------------
  // SECTION 3: UNIVERSAL WORKFLOW POLICY ENGINE BINDING
  // ------------------------------------------------------------

  await runTest(
    7,
    'Workflow Code Resolution for All Enterprise Transaction Types',
    'Policy Engine',
    async () => {
      const mappings: Record<string, string> = {
        PURCHASE_REQUISITION: 'WF-PROC-PR',
        PURCHASE_ORDER: 'WF-PROC-PO',
        GOODS_RECEIPT_NOTE: 'WF-PROC-GRN',
        MATERIAL_ISSUE: 'WF-INV-ISSUE',
        MATERIAL_RETURN: 'WF-INV-RETURN',
        SUBCONTRACT_WORK_ORDER: 'WF-PROC-WO',
        RA_BILL: 'WF-COMM-RA',
        PROJECT_CASH: 'WF-FIN-CASH',
        CASH_SETTLEMENT: 'WF-FIN-SETTLEMENT',
        PAYROLL_RUN: 'WF-HR-PAYROLL',
        EMPLOYEE_LOAN: 'WF-HR-LOAN',
      };

      for (const [entityType, expectedCode] of Object.entries(mappings)) {
        const resolved = workflowPolicyEngine.resolveWorkflowCode(entityType);
        if (resolved !== expectedCode) {
          throw new Error(`Failed resolving ${entityType}: expected ${expectedCode}, got ${resolved}`);
        }
      }
    }
  );

  await runTest(
    8,
    'Universal Binding: Material Issue Operational Binding',
    'Transaction Binding',
    async () => {
      const issueId = `mti-bind-${Date.now()}`;
      const bindResult = await universalWorkflowBindingService.bindOperationalTransaction({
        entityType: 'MATERIAL_ISSUE',
        entityId: issueId,
        entityNumber: 'MTI-2026-0044',
        title: 'Material Issue Voucher for Foundation Concrete',
        amount: 14500,
        projectId: 'PRJ-BURJ-01',
        requester: {
          id: 'emp-store-1',
          name: 'Store Officer',
          role: 'STORE_KEEPER',
        },
      });

      if (!bindResult.instance || bindResult.workflowCode !== 'WF-INV-ISSUE') {
        throw new Error('Failed to bind Material Issue to Universal Workflow Engine');
      }

      // Verify audit event exists
      const { events } = await enterpriseAuditRepository.queryEvents({
        entityType: 'MATERIAL_ISSUE',
        entityId: issueId,
      });
      if (events.length === 0) {
        throw new Error('Audit event not logged for Material Issue binding');
      }
    }
  );

  await runTest(
    9,
    'Universal Binding: Material Return Operational Binding',
    'Transaction Binding',
    async () => {
      const returnId = `mrt-bind-${Date.now()}`;
      const bindResult = await universalWorkflowBindingService.bindOperationalTransaction({
        entityType: 'MATERIAL_RETURN',
        entityId: returnId,
        entityNumber: 'MRT-2026-0012',
        title: 'Material Return: Surplus Rebar from Site B',
        amount: 3200,
        projectId: 'PRJ-BURJ-01',
        requester: {
          id: 'emp-site-2',
          name: 'Site Foreman',
          role: 'SITE_ENGINEER',
        },
      });

      if (!bindResult.instance || bindResult.workflowCode !== 'WF-INV-RETURN') {
        throw new Error('Failed to bind Material Return to Universal Workflow Engine');
      }
    }
  );

  await runTest(
    10,
    'Universal Binding: Subcontract Work Order Operational Binding',
    'Transaction Binding',
    async () => {
      const woId = `wo-bind-${Date.now()}`;
      const bindResult = await universalWorkflowBindingService.bindOperationalTransaction({
        entityType: 'SUBCONTRACT_WORK_ORDER',
        entityId: woId,
        entityNumber: 'WO-2026-0088',
        title: 'HVAC Ducting & MEP Subcontract Work Order',
        amount: 85000,
        projectId: 'PRJ-DUBAI-101',
        requester: {
          id: 'emp-contracts-1',
          name: 'Contracts Engineer',
          role: 'CONTRACTS_MANAGER',
        },
      });

      if (!bindResult.instance || bindResult.workflowCode !== 'WF-PROC-WO') {
        throw new Error('Failed to bind Work Order to Universal Workflow Engine');
      }
    }
  );

  await runTest(
    11,
    'Universal Binding: Running Account (RA) Bill Operational Binding',
    'Transaction Binding',
    async () => {
      const raBillId = `rabill-bind-${Date.now()}`;
      const bindResult = await universalWorkflowBindingService.bindOperationalTransaction({
        entityType: 'RA_BILL',
        entityId: raBillId,
        entityNumber: 'RA-2026-003',
        title: 'RA Bill #3 for Earthworks & Shoring',
        amount: 125000,
        projectId: 'PRJ-DUBAI-101',
        requester: {
          id: 'emp-contractor-1',
          name: 'Contractor Project Manager',
          role: 'CONTRACTOR_REP',
        },
      });

      if (!bindResult.instance || bindResult.workflowCode !== 'WF-COMM-RA') {
        throw new Error('Failed to bind RA Bill to Universal Workflow Engine');
      }
    }
  );

  await runTest(
    12,
    'Universal Binding: Project Cash Request Operational Binding',
    'Transaction Binding',
    async () => {
      const cashReqId = `cash-bind-${Date.now()}`;
      const bindResult = await universalWorkflowBindingService.bindOperationalTransaction({
        entityType: 'PROJECT_CASH',
        entityId: cashReqId,
        entityNumber: 'PCR-2026-0099',
        title: 'Site Diesel & Emergency Tool Petty Cash',
        amount: 5000,
        currency: 'AED',
        projectId: 'PRJ-DUBAI-101',
        requester: {
          id: 'emp-site-incharge',
          name: 'Site Incharge Tariq',
          role: 'SITE_INCHARGE',
        },
      });

      if (!bindResult.instance || bindResult.workflowCode !== 'WF-FIN-CASH') {
        throw new Error('Failed to bind Project Cash to Universal Workflow Engine');
      }
    }
  );

  await runTest(
    13,
    'Universal Binding: Cash Settlement Operational Binding',
    'Transaction Binding',
    async () => {
      const stlId = `stl-bind-${Date.now()}`;
      const bindResult = await universalWorkflowBindingService.bindOperationalTransaction({
        entityType: 'CASH_SETTLEMENT',
        entityId: stlId,
        entityNumber: 'STL-2026-0045',
        title: 'Cash Settlement for Site Fuel Vouchers',
        amount: 4800,
        currency: 'AED',
        projectId: 'PRJ-DUBAI-101',
        requester: {
          id: 'emp-site-incharge',
          name: 'Site Incharge Tariq',
          role: 'SITE_INCHARGE',
        },
      });

      if (!bindResult.instance || bindResult.workflowCode !== 'WF-FIN-SETTLEMENT') {
        throw new Error('Failed to bind Cash Settlement to Universal Workflow Engine');
      }
    }
  );

  await runTest(
    14,
    'Universal Binding: Payroll Run Operational Binding',
    'Transaction Binding',
    async () => {
      const payrollId = `pr-bind-${Date.now()}`;
      const bindResult = await universalWorkflowBindingService.bindOperationalTransaction({
        entityType: 'PAYROLL_RUN',
        entityId: payrollId,
        entityNumber: 'PR-2026-08',
        title: 'August 2026 WPS Payroll Batch',
        amount: 450000,
        currency: 'AED',
        requester: {
          id: 'emp-hr-1',
          name: 'HR Officer',
          role: 'HR_MANAGER',
        },
      });

      if (!bindResult.instance || bindResult.workflowCode !== 'WF-HR-PAYROLL') {
        throw new Error('Failed to bind Payroll Run to Universal Workflow Engine');
      }
    }
  );

  // ------------------------------------------------------------
  // SECTION 4: GOVERNANCE, MAKER-CHECKER & SOD ENFORCEMENT
  // ------------------------------------------------------------

  await runTest(
    15,
    'Governance Enforcement: Separation of Duties (Maker cannot Approve)',
    'Governance SoD',
    async () => {
      const reqId = `sod-test-${Date.now()}`;
      const creatorId = 'emp-creator-99';

      await universalWorkflowBindingService.bindOperationalTransaction({
        entityType: 'PURCHASE_REQUISITION',
        entityId: reqId,
        entityNumber: 'PR-SOD-001',
        title: 'Separation of Duties Verification PR',
        amount: 15000,
        requester: {
          id: creatorId,
          name: 'Creator User',
          role: 'PROCUREMENT_OFFICER',
        },
      });

      let blocked = false;
      try {
        await universalWorkflowBindingService.executeWorkflowTransition({
          entityType: 'PURCHASE_REQUISITION',
          entityId: reqId,
          action: 'APPROVE',
          user: {
            id: creatorId, // Same as creator
            name: 'Creator User',
            role: 'PROJECT_DIRECTOR',
          },
        });
      } catch (err: any) {
        if (err.message.includes('Governance Rule Violation') || err.message.includes('cannot perform') || err.message.includes('cannot approve')) {
          blocked = true;
        }
      }

      if (!blocked) {
        throw new Error('SoD violation: Creator was permitted to approve their own transaction');
      }
    }
  );

  await runTest(
    16,
    'Governance Enforcement: Verifier cannot simultaneously Approve',
    'Governance SoD',
    async () => {
      const reqId = `verifier-sod-${Date.now()}`;
      const verifierId = 'emp-verifier-10';

      await universalWorkflowBindingService.bindOperationalTransaction({
        entityType: 'RA_BILL',
        entityId: reqId,
        entityNumber: 'RA-SOD-002',
        title: 'SoD RA Bill Measurement Verification',
        amount: 50000,
        requester: {
          id: 'emp-contractor-5',
          name: 'Subcontractor Rep',
          role: 'CONTRACTOR_REP',
        },
      });

      // 1. Verifier verifies
      await universalWorkflowBindingService.executeWorkflowTransition({
        entityType: 'RA_BILL',
        entityId: reqId,
        action: 'VERIFY',
        user: {
          id: verifierId,
          name: 'Lead QS Verifier',
          role: 'QUANTITY_SURVEYOR',
        },
      });

      // 2. Same verifier attempts to approve
      let blocked = false;
      try {
        await universalWorkflowBindingService.executeWorkflowTransition({
          entityType: 'RA_BILL',
          entityId: reqId,
          action: 'APPROVE',
          user: {
            id: verifierId, // Same verifier
            name: 'Lead QS Verifier',
            role: 'PROJECT_DIRECTOR',
          },
        });
      } catch (err: any) {
        if (err.message.includes('Governance Rule Violation') || err.message.includes('cannot approve')) {
          blocked = true;
        }
      }

      if (!blocked) {
        throw new Error('SoD violation: Verifier was permitted to approve same transaction');
      }
    }
  );

  await runTest(
    17,
    'Governance Enforcement: Threshold Authorization Limit Validation',
    'Governance Policy',
    async () => {
      const poId = `thresh-po-${Date.now()}`;
      await universalWorkflowBindingService.bindOperationalTransaction({
        entityType: 'PURCHASE_ORDER',
        entityId: poId,
        entityNumber: 'PO-THRESH-001',
        title: 'High-Value Heavy Machinery Purchase Order',
        amount: 1500000, // 1.5 Million USD
        requester: {
          id: 'emp-buyer-1',
          name: 'Senior Buyer',
          role: 'PROCUREMENT_OFFICER',
        },
      });

      // Project Manager with 50,000 threshold attempts to approve 1.5M
      const evalResult = await universalWorkflowBindingService.evaluateEligibility({
        user: {
          id: 'emp-pm-1',
          name: 'Site Project Manager',
          role: 'PROJECT_MANAGER',
        },
        entityType: 'PURCHASE_ORDER',
        action: 'APPROVE',
        amount: 1500000,
      });

      if (evalResult.isEligible) {
        throw new Error('Threshold rule violation: PM was approved for amount exceeding limit');
      }
    }
  );

  await runTest(
    18,
    'End-to-End State Machine Transition: Submit -> Verify -> Approve -> Audit',
    'Lifecycle E2E',
    async () => {
      const entityId = `lifecycle-pr-${Date.now()}`;
      const entityNumber = 'PR-LIFE-2026';

      // 1. Submit
      await universalWorkflowBindingService.bindOperationalTransaction({
        entityType: 'PURCHASE_REQUISITION',
        entityId,
        entityNumber,
        title: 'Steel Rebar Procurement for Block A',
        amount: 42000,
        projectId: 'PRJ-101',
        requester: {
          id: 'emp-init-1',
          name: 'Site Engineer Tariq',
          role: 'SITE_ENGINEER',
        },
      });

      // 2. Verify
      const verifyRes = await universalWorkflowBindingService.executeWorkflowTransition({
        entityType: 'PURCHASE_REQUISITION',
        entityId,
        action: 'VERIFY',
        user: {
          id: 'emp-qs-1',
          name: 'Quantity Surveyor Alex',
          role: 'QUANTITY_SURVEYOR',
          assignedProjectId: 'PRJ-101',
        },
        remarks: 'Quantities cross-checked with structural model',
      });
      if (verifyRes.toState !== 'VERIFIED') {
        throw new Error(`Expected VERIFIED, got ${verifyRes.toState}`);
      }

      // 3. Approve
      const approveRes = await universalWorkflowBindingService.executeWorkflowTransition({
        entityType: 'PURCHASE_REQUISITION',
        entityId,
        action: 'APPROVE',
        user: {
          id: 'emp-dir-1',
          name: 'Director Vikram',
          role: 'PROJECT_DIRECTOR',
          assignedProjectId: 'PRJ-101',
        },
        remarks: 'Procurement budget released',
      });
      if (approveRes.toState !== 'APPROVED') {
        throw new Error(`Expected APPROVED, got ${approveRes.toState}`);
      }

      // 4. Audit Trail Verification
      const { events } = await enterpriseAuditRepository.queryEvents({
        entityType: 'PURCHASE_REQUISITION',
        entityId,
      });

      if (events.length < 3) {
        throw new Error(`Expected at least 3 lifecycle audit events, found ${events.length}`);
      }
    }
  );

  // ------------------------------------------------------------
  // SECTION 5: DOMAIN REPOSITORY INTEGRATION CHECKS
  // ------------------------------------------------------------

  await runTest(
    19,
    'Domain Integration: Inventory Material Return Cost Reversal & Audit',
    'Domain Repository',
    async () => {
      const whs = await inventoryRepository.getWarehouses();
      const mats = await inventoryRepository.getMaterials();

      const whId = whs.data[0]?.id || 'wh-1';
      const matId = mats.data[0]?.id || 'mat-1';

      const returnVoucher = await inventoryRepository.createMaterialReturn({
        warehouseId: whId,
        returnedBy: 'Foreman Salim',
        projectId: 'PRJ-101',
        projectName: 'Commercial Tower',
        reason: 'Surplus electrical conduits',
        items: [
          {
            materialId: matId,
            returnedQty: 5,
            unitPrice: 12,
          },
        ],
      });

      if (!returnVoucher || !returnVoucher.returnNumber) {
        throw new Error('Failed to create material return voucher');
      }

      // Verify enterprise audit was written
      const { events } = await enterpriseAuditRepository.queryEvents({
        entityType: 'MATERIAL_RETURN',
        entityId: returnVoucher.id,
      });

      if (events.length === 0) {
        throw new Error('Enterprise audit event was not recorded for material return');
      }
    }
  );

  await runTest(
    20,
    'Domain Integration: Contractor RA Bill Workflow & Audit Lifecycle',
    'Domain Repository',
    async () => {
      const bill = await procurementRepository.createRABill({
        projectId: 'PRJ-101',
        projectName: 'Marina Bay Tower',
        contractorName: 'Al Shafar Subcontracting LLC',
        contractorCode: 'CNT-901',
        contractorRepresentative: 'PM Mansoor',
        items: [
          {
            id: 'rab-item-1',
            boqItemId: 'boq-001',
            itemCode: 'BOQ-001',
            description: 'Excavation in Hard Rock',
            unit: 'M3',
            boqQuantity: 5000,
            boqRateUSD: 45,
            previousCumulativeQty: 1000,
            currentMeasuredQty: 800,
            totalCumulativeQty: 1800,
            currentAmountUSD: 36000,
            cumulativeAmountUSD: 81000,
          },
        ],
      });

      if (!bill || !bill.billNumber) {
        throw new Error('Failed to create RA Bill in procurement repository');
      }

      // Progress status through contractual scrutiny stages
      const underScrutiny = await procurementRepository.updateRABillStatus(bill.id, {
        status: 'Under Technical Scrutiny',
        actorId: 'usr-qs-verifier-01',
        actorName: 'Lead QS Verifier',
        actorRole: 'QUANTITY_SURVEYOR',
        remarks: 'Joint measurements undertaken on site',
      });

      if (!underScrutiny || underScrutiny.status !== 'Under Technical Scrutiny') {
        throw new Error('Failed to move RA Bill to Under Technical Scrutiny');
      }

      const certified = await procurementRepository.updateRABillStatus(bill.id, {
        status: 'Certified by QS',
        actorId: 'usr-qs-verifier-01',
        actorName: 'Lead QS Verifier',
        actorRole: 'QUANTITY_SURVEYOR',
        remarks: 'Measurement Book verified and rate variances checked',
      });

      if (!certified || certified.status !== 'Certified by QS') {
        throw new Error('Failed to update RA Bill to Certified by QS');
      }

      // Check enterprise audit events
      const { events } = await enterpriseAuditRepository.queryEvents({
        entityType: 'RA_BILL',
        entityId: bill.id,
      });

      if (events.length < 3) {
        throw new Error(`Expected at least 3 audit events for RA Bill, found ${events.length}`);
      }
    }
  );

  await runTest(
    21,
    'Domain Integration: Project Cash Request & Settlement Full Audit Loop',
    'Domain Repository',
    async () => {
      const cashReq = await projectCashRequestRepository.create({
        projectId: 'PRJ-101',
        projectName: 'Dubai Creek Residences',
        employeeId: 'emp-eng-44',
        employeeName: 'Eng. Khalid',
        amount: 3500,
        purpose: 'Site emergency crane diesel & consumables',
        category: 'SITE_OPERATIONS',
      });

      if (!cashReq || !cashReq.requestCode) {
        throw new Error('Failed to create cash request');
      }

      // Disburse
      await projectCashRequestRepository.disburseByFinance(cashReq.id, {
        financeId: 'emp-fin-01',
        financeName: 'Finance Officer David',
        paymentMethod: 'CASH',
        paymentReference: 'PETTY-2026-9901',
        disbursedAmount: 3500,
        remarks: 'Petty cash disbursed against receipt voucher',
      });

      // Settle
      const settlement = await projectCashRequestRepository.submitSettlement(cashReq.id, {
        employeeId: 'emp-eng-44',
        employeeName: 'Eng. Khalid',
        totalExpenseAmount: 3300,
        unspentCashReturned: 200,
        voucherItems: [{ desc: 'Diesel', amount: 3300 }],
        invoicesAndReceipts: [],
      });

      // Audit settlement
      await projectCashRequestRepository.auditSettlement(settlement.id, {
        auditorId: 'emp-audit-01',
        auditorName: 'Internal Auditor Sarah',
        remarks: 'Original petrol station receipts attached and verified',
        approved: true,
      });

      const { events } = await enterpriseAuditRepository.queryEvents({
        entityType: 'CASH_SETTLEMENT',
        entityId: settlement.id,
      });

      if (events.length < 2) {
        throw new Error(`Expected at least 2 settlement audit events, found ${events.length}`);
      }
    }
  );

  await runTest(
    22,
    'Comprehensive Audit Trail Performance & Schema Resilience',
    'Audit Performance',
    async () => {
      const batchPayload: AuditEventPayload[] = [];
      const batchSize = 25;

      for (let i = 0; i < batchSize; i++) {
        batchPayload.push({
          userName: `Automated Tester ${i}`,
          userRole: 'INTEGRATION_RUNNER',
          actionType: 'UPDATE',
          entityType: 'PERF_BENCHMARK',
          entityId: `perf-${i}`,
          entityNumber: `BENCH-${i}`,
          fromState: 'RUNNING',
          toState: 'COMPLETED',
          metadata: { iteration: i, timestamp: Date.now() },
        });
      }

      const t0 = Date.now();
      const recorded = await enterpriseAuditRepository.batchLogEvents(batchPayload);
      const latency = Date.now() - t0;

      if (recorded.length !== batchSize) {
        throw new Error(`Batch insertion count mismatch. Expected ${batchSize}, got ${recorded.length}`);
      }

      console.log(`     Batch insertion of ${batchSize} events completed in ${latency}ms`);
    }
  );

  // ------------------------------------------------------------
  // RESULTS SUMMARY
  // ------------------------------------------------------------
  console.log('\n============================================================');
  console.log('PHASE 5D VERIFICATION TEST RESULTS SUMMARY');
  console.log('============================================================');
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;

  console.log(`Total Tests Run: ${results.length}`);
  console.log(`Passed: \x1b[32m${passed}\x1b[0m`);
  console.log(`Failed: \x1b[${failed > 0 ? '31m' : '32m'}${failed}\x1b[0m`);
  console.log('============================================================\n');

  if (failed > 0) {
    console.error(`\x1b[31mPhase 5D verification failed with ${failed} failure(s).\x1b[0m`);
    process.exit(1);
  } else {
    console.log(`\x1b[32mAll ${passed} Phase 5D tests passed successfully!\x1b[0m`);
    process.exit(0);
  }
}

runSuite().catch((err) => {
  console.error('Fatal error executing Phase 5D verification suite:', err);
  process.exit(1);
});

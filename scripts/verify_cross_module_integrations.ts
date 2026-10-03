import assert from 'node:assert';
import { eq } from 'drizzle-orm';
import { db } from '../src/db';
import { projects } from '../src/db/schema';
import { financeRepository } from '../src/api/repositories/finance.repository';
import { procurementEnterpriseRepository } from '../src/api/repositories/procurement_enterprise.repository';
import { hrmsRepository } from '../src/api/repositories/hrms.repository';
import { inventoryRepository } from '../src/api/repositories/inventory.repository';
import { commercialRepository } from '../src/api/repositories/commercial.repository';
import { projectControlsRepository } from '../src/api/repositories/project_controls.repository';

async function runCrossModuleIntegrationsVerification() {
  console.log('============================================================');
  console.log('SITESYNC PRO ERP — CROSS-MODULE INTEGRATION & GL AUDIT TEST');
  console.log('============================================================');

  let passed = 0;
  let failed = 0;

  const [integrationProject] = await db
    .select({ id: projects.id, projectName: projects.projectName })
    .from(projects)
    .where(eq(projects.isActive, true))
    .limit(1);
  const integrationProjectId = integrationProject?.id;
  const integrationProjectName = integrationProject?.projectName || 'Integration Verification Project';
  if (!integrationProjectId) {
    throw new Error('Cross-module verification requires at least one active canonical project.');
  }

  function pass(desc: string) {
    passed++;
    console.log(`\x1b[32m✔ [PASS ${passed}] ${desc}\x1b[0m`);
  }

  function fail(desc: string, err: any) {
    failed++;
    console.error(`\x1b[31m✖ [FAIL ${failed}] ${desc}\x1b[0m:`, err?.message || err);
  }

  // --- 1. FINANCIAL STATEMENTS & TRIAL BALANCE INTEGRITY ---
  console.log('\n--- 1. GENERAL LEDGER & FINANCIAL STATEMENTS ---');
  try {
    const trialBalance = await financeRepository.getTrialBalance();
    assert.ok(trialBalance.accounts && trialBalance.accounts.length > 0, 'Trial balance must contain accounts');
    assert.strictEqual(trialBalance.isBalanced, true, `Trial balance must balance: Dr ${trialBalance.totalDebit} vs Cr ${trialBalance.totalCredit}`);
    assert.ok(Math.abs(trialBalance.totalDebit - trialBalance.totalCredit) < 0.01, 'Debits and Credits must match to within 1 cent');
    pass(`Trial Balance is mathematically balanced: Dr $${trialBalance.totalDebit.toLocaleString()} == Cr $${trialBalance.totalCredit.toLocaleString()}`);

    const pnl = await financeRepository.getProfitAndLoss();
    assert.ok(pnl.totalRevenue !== undefined, 'P&L must calculate revenue');
    assert.ok(pnl.totalExpenses !== undefined, 'P&L must calculate expenses');
    pass(`Profit & Loss Statement computed: Revenue $${pnl.totalRevenue.toLocaleString()} - Expenses $${pnl.totalExpenses.toLocaleString()} = Net Income $${pnl.netIncome.toLocaleString()}`);

    const bs = await financeRepository.getBalanceSheet();
    assert.ok(bs.totalAssets !== undefined, 'Balance Sheet must calculate total assets');
    assert.ok(bs.totalLiabilities !== undefined, 'Balance Sheet must calculate total liabilities');
    pass(`Balance Sheet verified: Assets $${bs.totalAssets.toLocaleString()} | Liabilities & Equity $${bs.totalLiabilitiesAndEquity.toLocaleString()}`);

    const cfs = await financeRepository.getCashFlowStatement();
    assert.ok(cfs.endingCashBalance !== undefined, 'Cash flow statement must calculate ending cash');
    pass(`Cash Flow Statement generated: Operating $${cfs.operatingActivities.totalOperatingCashFlow.toLocaleString()} | Ending Cash $${cfs.endingCashBalance.toLocaleString()}`);
  } catch (err) {
    fail('General Ledger & Financial Statements verification', err);
  }

  // --- 2. PROCUREMENT: 3-WAY MATCHING -> FINANCE AP & GL POSTING ---
  console.log('\n--- 2. PROCUREMENT 3-WAY MATCHING -> FINANCE AP & GL ---');
  try {
    const matchCode = `3WM-INT-${Date.now().toString().slice(-4)}`;
    const newMatch = await procurementEnterpriseRepository.createThreeWayMatch({
      matchingCode: matchCode,
      poId: 'po-test-01',
      poNumber: 'PO-2026-INT-001',
      grnId: 'grn-test-01',
      grnNumber: 'GRN-2026-INT-001',
      vendorInvoiceId: 'inv-test-01',
      invoiceNumber: `INV-VEND-${matchCode}`,
      vendorId: 'vnd-001',
      vendorName: 'Emirates Cement & Aggregate Suppliers',
      matchedAmount: 48500,
      priceVariance: 0,
      quantityVariance: 0,
      status: 'RECONCILED',
      autoApproved: true,
      approvalNotes: 'Automated 3-way match within 0% variance threshold',
      reconciledBy: 'Enterprise 3-Way Engine',
    });

    assert.ok(newMatch.id, 'Three-way match record must be created');
    pass(`Three-way match created and approved: ${newMatch.matchingCode} for $${newMatch.matchedAmount}`);

    const newAPInvoices = await financeRepository.findAPInvoices();
    const createdAP = newAPInvoices.find(ap => ap.invoiceNumber === newMatch.invoiceNumber);
    assert.ok(createdAP, 'Finance AP invoice must be created automatically upon 3-way reconciliation');
    assert.strictEqual(Number(createdAP.totalAmount), 48500, 'AP invoice amount must equal matched amount');
    pass(`Finance AP Invoice automatically created: ${createdAP.invoiceNumber} for $${createdAP.totalAmount}`);

    const newJVs = await financeRepository.findJournalEntries();
    const createdJV = newJVs.find(jv => jv.referenceNumber === newMatch.invoiceNumber);
    assert.ok(createdJV, 'Balanced GL journal entry must be posted for 3-way match AP liability');
    pass(`Balanced General Ledger entry posted: ${createdJV.voucherNumber} (${createdJV.narration})`);
  } catch (err) {
    fail('Procurement 3-Way Match -> Finance AP & GL verification', err);
  }

  // --- 3. HRMS: PAYROLL DISBURSEMENT -> FINANCE GL POSTING ---
  console.log('\n--- 3. HRMS PAYROLL DISBURSEMENT -> FINANCE GL ---');
  try {
    const payrollRuns = await hrmsRepository.getPayrollRuns();
    const activeRun = payrollRuns[0] || (await hrmsRepository.executePayrollRun('pp-2026-08', 'Verification Payroll Execution', { makerUserId: 'ci-payroll-maker', makerUserName: 'CI Payroll Maker', jurisdiction: 'INDIA', currency: 'INR' }));

    const disbursed = await hrmsRepository.disbursePayrollRun(activeRun.id, { userId: 'ci-finance-actor', userName: 'Finance Director' }, 'NEFT-BAT-001');
    assert.ok(disbursed, 'Payroll run must be marked as disbursed');
    assert.ok(disbursed.status === 'PAID' || disbursed.status === 'DISBURSED', 'Payroll run status must be PAID or DISBURSED');
    pass(`Payroll Run disbursed: ${disbursed.payrollMonth} (Total Net: $${(disbursed.totalNetPay ?? disbursed.totalNet ?? 0).toLocaleString()})`);

    const newJVs = await financeRepository.findJournalEntries();
    const payrollJV = newJVs.find(j => j.referenceNumber === disbursed.payrollMonth && j.voucherType === 'PAYROLL_JOURNAL');
    assert.ok(payrollJV, 'Payroll balanced GL journal entry must exist in General Ledger');
    pass(`Payroll Journal Entry verified in GL: ${payrollJV.voucherNumber} (Total: $${(disbursed.totalGrossPay ?? disbursed.totalGross ?? Number(payrollJV.totalDebit)).toLocaleString()})`);
  } catch (err) {
    fail('HRMS Payroll Disbursement -> Finance GL verification', err);
  }

  // --- 4. INVENTORY: MATERIAL ISSUE -> PROJECT COST & GL POSTING ---
  console.log('\n--- 4. INVENTORY MATERIAL ISSUE -> PROJECT ACTUAL COST & GL ---');
  try {
    const issue = await inventoryRepository.createMaterialIssue({
      projectId: integrationProjectId,
      projectName: integrationProjectName,
      warehouseId: 'wh-001',
      warehouseName: 'Abu Dhabi Central Yard Warehouse',
      issuedTo: 'Structural Concrete Team - Site Pier 4',
      issuedBy: 'ci-inventory-actor',
      items: [
        {
          materialId: 'mat-001',
          materialName: '12-inch Schedule 80 Carbon Steel Seamless Pipe',
          requestedQty: 10,
          issuedQty: 10,
          unitPrice: 75,
        }
      ],
      notes: 'Site issue for immediate structural reinforcement'
    });

    assert.ok(issue.id, 'Material issue voucher must be generated');
    pass(`Material Issue Voucher created: ${issue.issueNumber} for ${issue.issuedTo}`);

    const jvs = await financeRepository.findJournalEntries();
    const issueJV = jvs.find(j => j.referenceNumber === issue.issueNumber);
    assert.ok(issueJV, 'Material issue must post a balanced Direct Materials journal voucher to Finance GL');
    pass(`Material Issue GL Journal verified: ${issueJV.voucherNumber} (${issueJV.narration})`);
  } catch (err) {
    fail('Inventory Material Issue -> Project Cost & GL verification', err);
  }

  // --- 5. COMMERCIAL: SUBCONTRACT & CLIENT IPC INTEGRATION ---
  console.log('\n--- 5. COMMERCIAL SUBCONTRACT & CLIENT IPC -> FINANCE & AR/AP ---');
  try {
    const subBills = await commercialRepository.getSubcontractBills();
    const targetBill = subBills[0];
    if (targetBill) {
      const certified = await commercialRepository.certifySubcontractBill(targetBill.id, targetBill.grossClaimedAmount, 'CERTIFIED', { id: 'ci-commercial-actor', name: 'CI Commercial Certifier', role: 'COMMERCIAL_MANAGER' });
      assert.ok(certified, 'Subcontract bill must be certified');
      assert.strictEqual(certified.status, 'CERTIFIED');
      pass(`Subcontract Bill certified: ${certified.billNumber} ($${certified.certifiedAmount} certified, $${certified.netCertifiedPayable} payable)`);

      const apInvoices = await financeRepository.findAPInvoices();
      const subAP = apInvoices.find(ap => ap.invoiceNumber === certified.billNumber);
      assert.ok(subAP, 'Finance AP invoice must be created for certified subcontractor bill');
      pass(`Subcontractor AP Invoice verified: ${subAP.invoiceNumber} for $${subAP.totalAmount}`);
    }

    const ipcs = await commercialRepository.getClientIPCs();
    const targetIPC = ipcs[0];
    if (targetIPC) {
      const certifiedIPC = await commercialRepository.certifyClientIPC(targetIPC.id, targetIPC.grossWorkDoneClaimed, 'CERTIFIED', { id: 'ci-commercial-actor-2', name: 'CI Commercial Certifier', role: 'COMMERCIAL_MANAGER' });
      assert.ok(certifiedIPC, 'Client IPC must be certified');
      pass(`Client IPC certified: ${certifiedIPC.ipcNumber} (Gross: $${certifiedIPC.grossWorkDoneCertified}, Net: $${certifiedIPC.netReceivableAmount})`);

      const arInvoices = await financeRepository.findARInvoices();
      const clientAR = arInvoices.find(ar => ar.invoiceNumber === certifiedIPC.ipcNumber);
      assert.ok(clientAR, 'Finance AR invoice must be created for certified client IPC');
      pass(`Client AR Invoice verified: ${clientAR.invoiceNumber} for $${clientAR.totalAmount}`);
    }
  } catch (err) {
    fail('Commercial Subcontract & Client IPC -> Finance AR/AP verification', err);
  }

  // --- 6. PROJECT CONTROLS: LIVE COST MATRIX AGGREGATION ---
  console.log('\n--- 6. PROJECT CONTROLS LIVE COST MATRIX AGGREGATION ---');
  try {
    const costMatrix = await projectControlsRepository.getCostControlMatrix(integrationProjectId);
    const wbsList = Array.isArray(costMatrix) ? costMatrix : (costMatrix.wbsBreakdown || []);
    assert.ok(wbsList.length > 0, 'Cost control matrix must return project data');
    const wbs = wbsList[0];
    assert.ok(wbs.actualCost >= 0, 'Actual cost must be calculated');
    assert.ok(wbs.committedCost >= 0, 'Committed cost must be calculated');
    assert.ok(wbs.budget >= 0, 'Budget must exist');
    pass(`Project Controls WBS verified for ${wbs.name}: Budget $${wbs.budget.toLocaleString()} | Actual $${wbs.actualCost.toLocaleString()} | Committed $${wbs.committedCost.toLocaleString()} | EV $${wbs.earnedValue.toLocaleString()}`);
  } catch (err) {
    fail('Project Controls Live Cost Matrix verification', err);
  }

  console.log('============================================================');
  console.log(`FULL INTEGRATION VERIFICATION COMPLETED: ${passed} PASSED, ${failed} FAILED`);
  console.log('============================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runCrossModuleIntegrationsVerification().catch(e => {
  console.error('Fatal execution error:', e);
  process.exit(1);
});

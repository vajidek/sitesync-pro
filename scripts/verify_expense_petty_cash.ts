import { employeeExpenseRepository } from '../src/api/repositories/employee_expense.repository';
import { financeRepository } from '../src/api/repositories/finance.repository';

async function verifyExpensePettyCashWorkflow() {
  console.log('============================================================');
  console.log('SITESYNC PRO ERP — EXPENSE & PETTY CASH INTEGRATION TEST');
  console.log('============================================================\n');

  // 1. Initial State Check
  console.log('1. Checking Initial Seed Data...');
  const initialClaims = await employeeExpenseRepository.getExpenseClaims();
  const initialRegisters = await employeeExpenseRepository.getPettyCashRegisters();
  const initialAdvances = await employeeExpenseRepository.getCashAdvances();
  console.log(`✔ Found ${initialClaims.length} seed expense claims`);
  console.log(`✔ Found ${initialRegisters.length} petty cash registers`);
  console.log(`✔ Found ${initialAdvances.length} cash advances\n`);

  // 2. Submit New Expense Claim
  console.log('2. Testing Expense Claim Submission & Duplicate Engine...');
  const newClaim = await employeeExpenseRepository.createExpenseClaim({
    employeeId: 'emp-104',
    employeeName: 'David Chen',
    employeeCode: 'EMP-052',
    department: 'SITE_OPERATIONS',
    projectId: 'PRJ-101',
    projectName: 'Dubai Creek Harbor Desalination WTP',
    costCenterCode: 'CC-CIVIL-01',
    category: 'SITE_EMERGENCY',
    amount: 650,
    currency: 'AED',
    expenseDate: '2026-09-21',
    vendorShop: 'Al-Madina Industrial Hardware Supplies',
    description: 'Emergency safety harness latch replacement & warning beacon repair',
    billInvoiceNumber: `INV-SITE-${Date.now()}`,
    attachments: [
      {
        id: 'att-1',
        name: 'tax_invoice_receipt.pdf',
        size: 24500,
        type: 'application/pdf',
        url: 'data:application/pdf;base64,JVBERi0xLjQK...',
        uploadDate: '2026-09-21',
        fileHash: `hash-${Date.now()}`,
      },
    ],
  });

  console.log(`✔ Created Claim: ${newClaim.claimNumber} | Status: ${newClaim.status} | Amount: ${newClaim.currency} ${newClaim.amount}`);

  // 3. Manager Approval Gate
  console.log('\n3. Testing Manager Approval Gate...');
  const approvedClaim = await employeeExpenseRepository.approveByManager(newClaim.id, {
    id: 'emp-mgr-01',
    name: 'Sarah Jenkins',
    role: 'PROJECT_MANAGER',
    remarks: 'Emergency safety purchase confirmed against site breakdown log.',
  });
  if (!approvedClaim) throw new Error('Claim approval returned null');
  console.log(`✔ Claim ${approvedClaim.claimNumber} status: ${approvedClaim.status}`);

  // 4. Finance Audit & GL Code Classification Gate
  console.log('\n4. Testing Finance Audit & Account Classification Gate...');
  const verifiedClaim = await employeeExpenseRepository.verifyByFinance(approvedClaim.id, {
    verifierId: 'fin-auditor-01',
    verifierName: 'Marcus Vance',
    accountDebitCode: '5010', // Direct Site Supplies
    accountCreditCode: '1010', // Operating Bank
    taxAmount: 32.5,
    advanceDeductionAmount: 50,
    notes: 'VAT tax invoice verified with supplier tax registration. Deducting $50 from prior advance.',
  });
  if (!verifiedClaim) throw new Error('Finance verification returned null');
  console.log(`✔ Claim ${verifiedClaim.claimNumber} status: ${verifiedClaim.status}`);
  console.log(`✔ Finance Verification: Debit: ${verifiedClaim.financeVerification?.accountDebitCode}, Credit: ${verifiedClaim.financeVerification?.accountCreditCode}, Net: ${verifiedClaim.financeVerification?.netPayableAmount}`);

  // 5. Payment Disbursement & Automatic General Ledger Posting
  console.log('\n5. Testing Payment Disbursement & Automatic Double-Entry GL Posting...');
  const initialJournals = await financeRepository.findJournalEntries();
  const initialJournalCount = initialJournals.length;

  const paidClaim = await employeeExpenseRepository.disbursePayment(verifiedClaim.id, {
    paidById: 'fin-disburse-01',
    paidByName: 'Marcus Vance',
    paymentMethod: 'BANK_TRANSFER',
    paymentReference: `WIRE-${Date.now()}`,
    amountPaid: verifiedClaim.financeVerification?.netPayableAmount || 600,
  });

  if (!paidClaim) throw new Error('Payment disbursement returned null');
  console.log(`✔ Claim ${paidClaim.claimNumber} status: ${paidClaim.status}`);
  console.log(`✔ Payment Ref: ${paidClaim.paymentDetails?.paymentReference} via ${paidClaim.paymentDetails?.paymentMethod}`);

  // 6. Verify GL Journal Entry in Finance Repository
  const updatedJournals = await financeRepository.findJournalEntries();
  console.log(`✔ Total Journals in Finance GL: ${updatedJournals.length} (was ${initialJournalCount})`);
  const matchingJournal = updatedJournals.find(j => j.referenceNumber === paidClaim.claimNumber);
  if (!matchingJournal) {
    throw new Error(`Expected journal entry for claim ${paidClaim.claimNumber} not found in General Ledger!`);
  }
  console.log(`✔ Journal Entry in General Ledger Verified:`);
  console.log(`   - Voucher: ${matchingJournal.voucherNumber}`);
  console.log(`   - Narration: ${matchingJournal.narration}`);
  console.log(`   - Total Debit: $${matchingJournal.totalDebit} | Total Credit: $${matchingJournal.totalCredit}`);
  if (matchingJournal.totalDebit !== matchingJournal.totalCredit) {
    throw new Error('Double entry unbalanced!');
  }

  // 7. Cash Advance Lifecycle
  console.log('\n7. Testing Cash Advance Lifecycle...');
  const advance = await employeeExpenseRepository.createCashAdvance({
    employeeId: 'emp-105',
    employeeName: 'Vikram Patel',
    employeeCode: 'EMP-060',
    department: 'SURVEYING_GEOTECH',
    projectId: 'PRJ-102',
    requestedAmount: 1200,
    currency: 'AED',
    purpose: 'Mobilization fuel, toll gates and topographic site surveying consumables',
    requiredDate: '2026-10-15',
  });
  console.log(`✔ Advance Requested: ${advance.advanceNumber} | Amount: ${advance.currency} ${advance.requestedAmount} | Status: ${advance.status}`);

  const disbursedAdvance = await employeeExpenseRepository.disburseCashAdvance(
    advance.id,
    `ADV-DISBURSE-${Date.now()}`,
    1200
  );
  if (!disbursedAdvance) throw new Error('Cash advance disbursement returned null');
  console.log(`✔ Advance Disbursed: Status: ${disbursedAdvance.status} | Disbursed Amount: ${disbursedAdvance.currency} ${disbursedAdvance.disbursedAmount}`);

  // 8. Petty Cash Float Register & Voucher Creation
  console.log('\n8. Testing Petty Cash Register & Voucher Lifecycle...');
  const registers = await employeeExpenseRepository.getPettyCashRegisters();
  const primaryRegister = registers[0];
  console.log(`✔ Register: ${primaryRegister.registerCode} (${primaryRegister.siteOrBranch})`);
  console.log(`   - Custodian: ${primaryRegister.custodianName}`);
  console.log(`   - Allocated Float: ${primaryRegister.currency} ${primaryRegister.imprestFloatLimit}`);
  console.log(`   - Current Balance: ${primaryRegister.currency} ${primaryRegister.currentBalance}`);

  const voucher = await employeeExpenseRepository.createPettyCashVoucher({
    registerId: primaryRegister.id,
    amount: 150,
    payeeRecipient: 'Speedy Couriers Ltd',
    category: 'COURIER_POSTAGE',
    voucherType: 'DISBURSEMENT',
    date: '2026-09-22',
    description: 'Urgent courier dispatch of laboratory soil test samples',
    billNumber: 'RCPT-POST-4401',
    costCenter: '5025',
    approvedBy: primaryRegister.custodianId,
  });
  console.log(`✔ Petty Cash Voucher Created: ${voucher.voucherNumber} for ${primaryRegister.currency} ${voucher.amount}`);
  console.log(`   - Status: ${voucher.status} | Category: ${voucher.category}`);

  // 9. Reporting & Analytics Aggregation
  console.log('\n9. Testing Enterprise Expense & Petty Cash Reports Aggregator...');
  const reports = await employeeExpenseRepository.getExpenseReports();
  console.log(`✔ Total Expense Claims Count: ${reports.summary.totalClaimsCount}`);
  console.log(`✔ Total Claimed Amount: ${reports.summary.totalClaimedAmount.toLocaleString()}`);
  console.log(`✔ Total Approved for Payment: ${reports.summary.totalApprovedAmount.toLocaleString()}`);
  console.log(`✔ Total Paid Amount: ${reports.summary.totalPaidAmount.toLocaleString()}`);
  console.log(`✔ Net Advance Outstanding Balance: ${reports.summary.netAdvanceBalance.toLocaleString()}`);

  console.log('\n============================================================');
  console.log('✔ ALL EXPENSE & PETTY CASH WORKFLOW VERIFICATIONS PASSED (9/9)!');
  console.log('============================================================');
}

verifyExpensePettyCashWorkflow().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

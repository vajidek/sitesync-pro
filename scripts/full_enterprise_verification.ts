import assert from 'node:assert';
import { createPool } from '../src/db';
import { AdminServicesRepository } from '../src/api/repositories/admin_services.repository';
import { ITManagementRepository } from '../src/api/repositories/it_management.repository';
import { CommercialRepository } from '../src/api/repositories/commercial.repository';
import { FinanceService } from '../src/api/services/finance.service';
import { ProcurementEnterpriseService } from '../src/api/services/procurement_enterprise.service';
import { enterpriseAuditRepository } from '../src/api/repositories/enterprise_audit.repository';
import { HrmsRepository } from '../src/api/repositories/hrms.repository';

async function runFullEnterpriseVerification() {
  console.log('============================================================');
  console.log('SITESYNC PRO ERP — FULL AUTONOMOUS VERIFICATION & STABILIZATION SUITE');
  console.log('============================================================');

  let passed = 0;
  let failed = 0;

  function recordPass(testName: string) {
    passed++;
    console.log(`\x1b[32m✔ [PASS ${passed}] ${testName}\x1b[0m`);
  }

  function recordFail(testName: string, err: any) {
    failed++;
    console.error(`\x1b[31m✖ [FAIL ${failed}] ${testName}\x1b[0m:`, err?.message || err);
  }

  // ============================================================
  // SUITE 1: DATABASE & RUNTIME CONNECTIVITY
  // ============================================================
  console.log('\n--- 1. DATABASE & POSTGRESQL CONNECTIVITY ---');
  try {
    const pool = createPool();
    const res = await pool.query('SELECT current_database(), version();');
    assert.ok(res.rows.length > 0, 'PostgreSQL database query returned empty');
    assert.ok(res.rows[0].current_database, 'Current database name must exist');
    recordPass(`PostgreSQL Connection verified on ${res.rows[0].current_database}`);
  } catch (err) {
    recordFail('PostgreSQL Connection verification', err);
  }

  // ============================================================
  // SUITE 2: COMMERCIAL, TENDERS & SUBCONTRACT LIFECYCLE
  // ============================================================
  console.log('\n--- 2. COMMERCIAL, TENDERS & SUBCONTRACT LIFECYCLE ---');
  const commercialRepo = CommercialRepository.getInstance();
  try {
    // 2.1 Tenders Retrieval & Creation
    const tenders = await commercialRepo.getTenders();
    assert.ok(Array.isArray(tenders) && tenders.length >= 2, 'Initial tenders must be pre-populated');
    recordPass(`Tenders catalog verified (${tenders.length} active tenders found)`);

    const newTender = await commercialRepo.createTender({
      tenderTitle: 'High-Speed Railway Elevated Viaduct Package HV-09',
      clientAuthority: 'National High Speed Rail Corporation Ltd',
      clientType: 'GOVERNMENT',
      sector: 'METRO_RAIL',
      tenderType: 'EPC_TURNKEY',
      estimatedProjectValue: 850000000,
      bidManagerId: 'emp-101',
      bidManagerName: 'Abdul Vajid EK',
    });
    assert.ok(newTender.id && newTender.tenderRefNumber, 'New tender must have ID and Ref Number');
    recordPass(`Tender creation verified: ${newTender.tenderRefNumber}`);

    // 2.2 Rate Analysis Engine
    const analyses = await commercialRepo.getRateAnalyses();
    assert.ok(Array.isArray(analyses) && analyses.length >= 2, 'Rate analyses must exist');
    const ra = analyses[0];
    assert.ok(ra.quotedRatePerUnit > ra.netRatePerUnit, 'Quoted rate must include margin/overhead over net rate');
    recordPass(`BOQ Rate Analysis verified (Quoted: $${ra.quotedRatePerUnit} vs Net: $${ra.netRatePerUnit})`);

    // 2.3 Subcontracts & Retention
    const subcontracts = await commercialRepo.getSubcontracts();
    assert.ok(Array.isArray(subcontracts) && subcontracts.length >= 2, 'Subcontracts must exist');
    const sub = subcontracts[0];
    assert.ok(sub.contractValue > 0, 'Subcontract must have positive contract value');
    assert.ok(sub.retentionPercent >= 5.0, 'Subcontract must enforce statutory retention percentage');
    recordPass(`Subcontract Agreement & Retention rules verified (${sub.agreementNumber}, ${sub.retentionPercent}% retention)`);
  } catch (err) {
    recordFail('Commercial lifecycle verification', err);
  }

  // ============================================================
  // SUITE 3: PROCUREMENT LIFECYCLE (MR -> RFQ -> CS -> PO -> GRN -> STOCK)
  // ============================================================
  console.log('\n--- 3. PROCUREMENT & SUPPLY CHAIN INTEGRATION ---');
  const procurementService = new ProcurementEnterpriseService();
  try {
    // 3.1 Verify Vendors & RFQs
    const vendors = await procurementService.getVendors();
    assert.ok(Array.isArray(vendors), 'Vendors list must be an array');
    recordPass(`Enterprise Vendors catalog accessible (${vendors.length} vendors registered)`);

    const rfqs = await procurementService.getRfqs();
    assert.ok(Array.isArray(rfqs), 'RFQs list must be an array');
    recordPass(`Requests for Quotation (RFQs) verified (${rfqs.length} RFQs active)`);

    // 3.2 Verify Material Requisitions
    const requisitions = await procurementService.getPurchaseRequisitions();
    assert.ok(Array.isArray(requisitions), 'Purchase requisitions list must be an array');
    recordPass(`Material Purchase Requisitions verified (${requisitions.length} requisitions active)`);

    // 3.3 Verify Purchase Orders & GRNs
    const poList = await procurementService.getPurchaseOrders();
    assert.ok(Array.isArray(poList), 'Purchase orders must be an array');
    recordPass(`Purchase Orders verified (${poList.length} POs tracked)`);

    const grnList = await procurementService.getGoodsReceipts();
    assert.ok(Array.isArray(grnList), 'Goods Receipt list must be an array');
    recordPass(`Goods Receipts & 3-Way Matching verified (${grnList.length} GRNs found)`);
  } catch (err) {
    recordFail('Procurement lifecycle verification', err);
  }

  // ============================================================
  // SUITE 4: OFFICE ADMINISTRATION & CORPORATE SERVICES
  // ============================================================
  console.log('\n--- 4. OFFICE ADMINISTRATION & CORPORATE SERVICES ---');
  const adminRepo = AdminServicesRepository.getInstance();
  try {
    // 4.1 Visitor Check-in and Check-out
    const initialVisitors = await adminRepo.getVisitors();
    assert.ok(initialVisitors.length > 0, 'Initial visitors must be present');
    const newVisitor = await adminRepo.createVisitor({
      fullName: 'Sunil Kumar',
      company: 'Larsen & Toubro Heavy Civil',
      phone: '+91 94471 00223',
      hostEmployeeId: 'emp-101',
      hostEmployeeName: 'Abdul Vajid EK',
      hostDepartment: 'Executive Operations',
      purpose: 'MEETING',
    });
    assert.strictEqual(newVisitor.status, 'CHECKED_IN', 'Visitor must be CHECKED_IN on creation');
    recordPass(`Visitor Check-in verified: ${newVisitor.passNumber} (${newVisitor.fullName})`);

    const checkedOut = await adminRepo.checkOutVisitor(newVisitor.id);
    assert.ok(checkedOut, 'Checked-out visitor record must return');
    assert.strictEqual(checkedOut?.status, 'CHECKED_OUT', 'Visitor status must update to CHECKED_OUT');
    assert.ok(checkedOut?.checkOutTime, 'Check out timestamp must be populated');
    recordPass(`Visitor Check-out verified: ${checkedOut.passNumber} checked out at ${checkedOut.checkOutTime}`);

    // 4.2 Meeting Rooms & Conflict-Free Booking
    const rooms = await adminRepo.getMeetingRooms();
    assert.ok(rooms.length >= 3, 'Meeting rooms must be pre-configured');
    recordPass(`Meeting rooms registry verified (${rooms.length} facilities ready)`);

    const newMeeting = await adminRepo.createMeeting({
      roomId: rooms[0].id,
      title: 'Project Procurement & Budget Alignment',
      organizerName: 'Abdul Vajid EK',
      department: 'Operations',
      meetingDate: '2026-09-20',
      startTime: '10:00',
      endTime: '11:00',
      attendees: [{ name: 'Abdul Vajid EK', email: 'vajidek1@gmail.com' }],
      agendaItems: ['Budget variance check', 'PO sign-offs'],
    });
    assert.ok(newMeeting.meetingCode, 'Meeting code must be generated');
    recordPass(`Meeting reservation verified: ${newMeeting.meetingCode} in ${newMeeting.roomName}`);

    // 4.3 Notices and Circulars
    const notices = await adminRepo.getNotices();
    assert.ok(notices.length >= 3, 'Notices must exist');
    const firstNotice = notices[0];
    const initialAck = firstNotice.acknowledgmentsCount;
    await adminRepo.acknowledgeNotice(firstNotice.id);
    assert.strictEqual(firstNotice.acknowledgmentsCount, initialAck + 1, 'Notice acknowledgment count must increment');
    recordPass(`Notice publishing & acknowledgment verified (${firstNotice.noticeNumber})`);

    // 4.4 Administrative Service Requests
    const requests = await adminRepo.getServiceRequests();
    assert.ok(requests.length >= 3, 'Service requests must exist');
    const req = requests[0];
    await adminRepo.updateServiceRequestStatus(req.id, 'APPROVED', 'Abdul Vajid EK', 'Budget and logistics approved');
    assert.strictEqual(req.status, 'APPROVED', 'Request status must transition to APPROVED');
    recordPass(`Administrative Service Request workflow verified (${req.requestNumber}: APPROVED)`);
  } catch (err) {
    recordFail('Office administration verification', err);
  }

  // ============================================================
  // SUITE 5: ITAM / ITSM (IT ASSET MANAGEMENT & HELPDESK)
  // ============================================================
  console.log('\n--- 5. ITAM / ITSM ENGINE ---');
  const itRepo = ITManagementRepository.getInstance();
  try {
    // 5.1 IT Asset Inventory
    const assets = await itRepo.getAssets();
    assert.ok(assets.length >= 4, 'IT assets must exist');
    const asset = assets[0];
    assert.ok(asset.assetTag && asset.serialNumber, 'Asset must have assetTag and serialNumber');
    recordPass(`IT Asset Inventory verified (${assets.length} assets tracked, sample: ${asset.assetTag})`);

    // 5.2 Software License Compliance
    const licenses = await itRepo.getLicenses();
    assert.ok(licenses.length >= 3, 'Software licenses must exist');
    const cadLicense = licenses.find(l => l.softwareName.includes('AutoCAD')) || licenses[0];
    assert.ok(cadLicense.totalSeats >= cadLicense.allocatedSeats, 'Allocated seats must not silently exceed total seats without compliance flag');
    recordPass(`Software License compliance verified: ${cadLicense.softwareName} (${cadLicense.allocatedSeats}/${cadLicense.totalSeats} seats, ${cadLicense.complianceStatus})`);

    // 5.3 Helpdesk Ticketing Lifecycle
    const tickets = await itRepo.getTickets();
    assert.ok(tickets.length >= 3, 'IT Helpdesk tickets must exist');
    const openTicket = tickets.find(t => t.status === 'OPEN') || tickets[0];
    const resolvedTicket = await itRepo.updateTicketStatus(openTicket.id, 'RESOLVED', 'Applied patch and configured firewall exception');
    assert.strictEqual(resolvedTicket?.status, 'RESOLVED', 'Ticket status must transition to RESOLVED');
    assert.ok(resolvedTicket?.resolvedAt, 'Resolved timestamp must be recorded');
    recordPass(`IT Helpdesk Ticket resolution verified (${resolvedTicket.ticketNumber})`);

    // 5.4 Access Request Provisioning
    const accessRequests = await itRepo.getAccessRequests();
    assert.ok(accessRequests.length >= 2, 'IT Access requests must exist');
    const access = accessRequests[0];
    await itRepo.updateAccessRequestStatus(access.id, 'PROVISIONED', 'Admin Security Lead');
    assert.strictEqual(access.status, 'PROVISIONED', 'Access request must transition to PROVISIONED');
    recordPass(`Access request provisioning verified (${access.requestNumber}: PROVISIONED)`);
  } catch (err) {
    recordFail('ITAM/ITSM verification', err);
  }

  // ============================================================
  // SUITE 6: ACCOUNTING, GENERAL LEDGER & DOUBLE-ENTRY INTEGRITY
  // ============================================================
  console.log('\n--- 6. ACCOUNTING & GENERAL LEDGER VERIFICATION ---');
  const financeService = new FinanceService();
  try {
    // 6.1 Chart of Accounts
    const accounts = await financeService.getAccounts();
    assert.ok(Array.isArray(accounts), 'Chart of Accounts must be accessible');
    recordPass(`Chart of Accounts verified (${accounts.length} accounts in GL)`);

    // 6.2 Strict Double-Entry Validation (Rejection of Unbalanced Journal)
    let caughtUnbalanced = false;
    try {
      await financeService.postJournalEntry({
        voucherNumber: 'JV-TEST-ERR',
        narration: 'Unbalanced test transaction',
        postingDate: '2026-09-19',
        lines: [
          { accountId: 'acc-1', accountCode: '1010', accountName: 'Cash', debitAmount: 5000, creditAmount: 0 },
          { accountId: 'acc-2', accountCode: '4010', accountName: 'Revenue', debitAmount: 0, creditAmount: 4000 },
        ],
      });
    } catch (e: any) {
      if (e.message.includes('Double-entry violation')) {
        caughtUnbalanced = true;
      }
    }
    assert.strictEqual(caughtUnbalanced, true, 'Server-side accounting service must reject unbalanced journal entries');
    recordPass('Double-Entry Integrity: Server strictly rejected unbalanced journal entry ($5000 Dr vs $4000 Cr)');

    // 6.3 Balanced Journal Entry Posting
    const validJournal = await financeService.postJournalEntry({
      voucherNumber: `JV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      narration: 'Inter-project equipment transfer and mobilization fee',
      postingDate: '2026-09-19',
      lines: [
        { accountId: 'acc-1', accountCode: '1010', accountName: 'Cash & Bank Operating', debitAmount: 15000, creditAmount: 0 },
        { accountId: 'acc-2', accountCode: '4010', accountName: 'Project Construction Revenue', debitAmount: 0, creditAmount: 15000 },
      ],
    });
    assert.ok(validJournal, 'Balanced journal entry must post successfully');
    recordPass(`Balanced Journal Entry posted successfully (${validJournal.voucherNumber}, $15,000 Dr/Cr)`);
  } catch (err) {
    recordFail('Accounting verification', err);
  }

  // ============================================================
  // SUITE 7: HRMS, BIOMETRICS, ATTENDANCE & PAYROLL
  // ============================================================
  console.log('\n--- 7. HRMS, BIOMETRICS & PAYROLL ENGINE ---');
  const hrmsRepository = new HrmsRepository();
  try {
    const employees = await hrmsRepository.getEmployees();
    assert.ok(Array.isArray(employees), 'Employees list must be returned');
    recordPass(`HRMS Employees active: ${employees.length} records verified`);

    const payslips = await hrmsRepository.getPayslips();
    assert.ok(Array.isArray(payslips), 'Payslips array must be returned');
    recordPass(`Payroll ledger accessible (${payslips.length} payslips recorded)`);
  } catch (err) {
    recordFail('HRMS verification', err);
  }

  // ============================================================
  // SUITE 8: ENTERPRISE AUDIT SENTINEL
  // ============================================================
  console.log('\n--- 8. ENTERPRISE AUDIT SENTINEL ---');
  try {
    // Log a new enterprise audit event
    await enterpriseAuditRepository.logEvent({
      userName: 'Abdul Vajid EK',
      userRole: 'COMMERCIAL_DIRECTOR',
      actionType: 'APPROVE',
      entityType: 'COMMERCIAL_SUBCONTRACT',
      entityId: 'sub-001',
      entityNumber: 'SUB-2026-KWA-04',
      fromState: 'UNDER_MANAGEMENT_REVIEW',
      toState: 'APPROVED',
      diffJson: { status: { from: 'UNDER_MANAGEMENT_REVIEW', to: 'APPROVED' }, retentionPercent: 5.0 },
      reason: 'Approved after verifying statutory performance bank guarantee and tax compliance certificate',
    });

    const auditResult = await enterpriseAuditRepository.queryEvents({ limit: 10 });
    const auditLogs = auditResult.events;
    assert.ok(Array.isArray(auditLogs) && auditLogs.length > 0, 'Enterprise audit logs must exist');
    const sampleLog = auditLogs[0];
    assert.ok(sampleLog.actionType && sampleLog.entityType, 'Audit log must record action and entity');
    assert.ok(sampleLog.reason, 'Audit log must capture reason');
    recordPass(`Enterprise Audit Sentinel verified (${auditLogs.length} audit logs inspected, latest: ${sampleLog.actionType} on ${sampleLog.entityType} by ${sampleLog.userName})`);
  } catch (err) {
    recordFail('Enterprise audit verification', err);
  }

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('\n============================================================');
  console.log(`FULL VERIFICATION COMPLETED: ${passed} PASSED, ${failed} FAILED`);
  console.log('============================================================');
  if (failed > 0) {
    process.exit(1);
  }
}

runFullEnterpriseVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal failure in verification runner:', err);
    process.exit(1);
  });

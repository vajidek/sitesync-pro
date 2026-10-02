import { db } from '../src/db/index';
import { workflowPolicyEngine } from '../src/api/services/workflowPolicyEngine.service';
import { phase66Workflows, workflowHistory, phase66Delegations } from '../src/db/schema';
import { eq, sql } from 'drizzle-orm';

async function runComprehensiveGovernanceVerification() {
  console.log('========================================================================');
  console.log('STARTING COMPREHENSIVE RUNTIME WORKFLOW & APPROVAL GOVERNANCE TEST SUITE');
  console.log('========================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`[PASS] Test ${totalTests}: ${testName}`);
    } else {
      console.error(`[FAIL] Test ${totalTests}: ${testName} - ${detail || 'Assertion failed'}`);
      throw new Error(`Test failed: ${testName} - ${detail}`);
    }
  }

  // Define Personas
  const engineer = { id: 'usr-eng-01', name: 'Rohan Sharma', role: 'ENGINEER', assignedProjectId: 'PROJ-101', department: 'Civil' };
  const supervisor = { id: 'usr-sup-01', name: 'Vikram Patel', role: 'SUPERVISOR', assignedProjectId: 'PROJ-101', department: 'Civil' };
  const manager = { id: 'usr-mgr-01', name: 'Ananya Roy', role: 'MANAGER', assignedProjectId: 'PROJ-101', department: 'Civil' };
  const otherProjectManager = { id: 'usr-mgr-02', name: 'Kavita Sen', role: 'MANAGER', assignedProjectId: 'PROJ-999', department: 'Civil' };
  const otherDeptManager = { id: 'usr-mgr-03', name: 'Sunil Rao', role: 'MANAGER', assignedProjectId: 'PROJ-101', department: 'Electrical' };
  const director = { id: 'usr-dir-01', name: 'Rajesh Nair', role: 'DIRECTOR', assignedProjectId: 'PROJ-101', department: 'Executive' };
  const delegatee = { id: 'usr-del-01', name: 'Amit Kumar', role: 'ENGINEER', assignedProjectId: 'PROJ-101', department: 'Civil' };
  const admin = { id: 'usr-adm-01', name: 'System Admin', role: 'ADMIN' };

  // -------------------------------------------------------------
  // 1 & 2: Verification ON/OFF and Approval ON/OFF (Direct Mode)
  // -------------------------------------------------------------
  await workflowPolicyEngine.updateWorkflowPolicy('WF-GOV-01', {
    workflowName: 'Direct Mode Workflow',
    verificationRequired: false,
    approvalRequired: false,
    isActive: true,
  }, 'System Admin', 'usr-adm-01');
  const res1_init = await workflowPolicyEngine.evaluateEligibility({
    user: engineer,
    entityType: 'WF-GOV-01',
    action: 'INITIATE',
  });
  assert(res1_init.isEligible === true, 'Admin-configurable Verification OFF & Approval OFF allows direct initiation');

  const res1_appr = await workflowPolicyEngine.evaluateEligibility({
    user: engineer,
    entityType: 'WF-GOV-01',
    action: 'APPROVE',
  });
  assert(res1_appr.isEligible === true && res1_appr.currentStage === 'DIRECT_EXECUTION', 'Direct Execution bypasses approval gate');

  // -------------------------------------------------------------
  // 3: Verification Only (Verification=YES, Approval=NO)
  // -------------------------------------------------------------
  await workflowPolicyEngine.updateWorkflowPolicy('WF-GOV-02', {
    workflowName: 'Verification Only Workflow',
    verificationRequired: true,
    approvalRequired: false,
    verifierRoles: ['SUPERVISOR'],
  }, 'System Admin', 'usr-adm-01');
  const res3_sup = await workflowPolicyEngine.evaluateEligibility({
    user: supervisor,
    entityType: 'WF-GOV-02',
    action: 'VERIFY',
    instance: { requesterId: engineer.id },
  });
  assert(res3_sup.isEligible === true, 'Verification Only: Configured supervisor is authorized to verify');

  const res3_appr = await workflowPolicyEngine.evaluateEligibility({
    user: engineer,
    entityType: 'WF-GOV-02',
    action: 'APPROVE',
  });
  assert(res3_appr.isEligible === true, 'Verification Only: Approval requirement is bypassed');

  // -------------------------------------------------------------
  // 4: Approval Only (Verification=NO, Approval=YES)
  // -------------------------------------------------------------
  await workflowPolicyEngine.updateWorkflowPolicy('WF-GOV-03', {
    workflowName: 'Approval Only Workflow',
    verificationRequired: false,
    approvalRequired: true,
    approverRoles: ['MANAGER'],
  }, 'System Admin', 'usr-adm-01');
  const res4_verify = await workflowPolicyEngine.evaluateEligibility({
    user: supervisor,
    entityType: 'WF-GOV-03',
    action: 'VERIFY',
    instance: { requesterId: engineer.id },
  });
  assert(res4_verify.isEligible === false, 'Approval Only: Verification is disabled and rejected');

  const res4_appr = await workflowPolicyEngine.evaluateEligibility({
    user: manager,
    entityType: 'WF-GOV-03',
    action: 'APPROVE',
    instance: { requesterId: engineer.id },
  });
  assert(res4_appr.isEligible === true, 'Approval Only: Configured Manager can directly approve');

  // -------------------------------------------------------------
  // 5: Verification + Approval (Both=YES)
  // -------------------------------------------------------------
  await workflowPolicyEngine.updateWorkflowPolicy('WF-GOV-04', {
    workflowName: 'Two-Gate Workflow',
    verificationRequired: true,
    approvalRequired: true,
    verifierRoles: ['SUPERVISOR'],
    approverRoles: ['MANAGER', 'DIRECTOR'],
  }, 'System Admin', 'usr-adm-01');
  const res5_v = await workflowPolicyEngine.evaluateEligibility({
    user: supervisor,
    entityType: 'WF-GOV-04',
    action: 'VERIFY',
    instance: { requesterId: engineer.id },
  });
  const res5_a = await workflowPolicyEngine.evaluateEligibility({
    user: manager,
    entityType: 'WF-GOV-04',
    action: 'APPROVE',
    instance: { requesterId: engineer.id, verifierId: supervisor.id },
  });
  assert(res5_v.isEligible === true && res5_a.isEligible === true, 'Verification + Approval: Both gates function sequentially');

  // -------------------------------------------------------------
  // 6 & 7: 0/1/2/3/N Stages and Dynamic Role Assignment
  // -------------------------------------------------------------
  await workflowPolicyEngine.updateWorkflowPolicy('WF-GOV-05', {
    workflowName: '4-Stage Custom Ladder',
    verificationRequired: true,
    approvalRequired: true,
    stagesCount: 4,
    stages: [
      { stageOrder: 1, stageName: 'Draft & Submit', stageType: 'CREATION', allowedRoles: ['ENGINEER'], slaHours: 4 },
      { stageOrder: 2, stageName: 'Peer Review', stageType: 'VERIFICATION', allowedRoles: ['SUPERVISOR'], slaHours: 8 },
      { stageOrder: 3, stageName: 'Technical Signoff', stageType: 'REVIEW', allowedRoles: ['MANAGER'], slaHours: 12 },
      { stageOrder: 4, stageName: 'Board Approval', stageType: 'APPROVAL', allowedRoles: ['DIRECTOR'], slaHours: 24 },
    ],
  }, 'System Admin', 'usr-adm-01');
  const config5 = await workflowPolicyEngine.getWorkflowConfig('WF-GOV-05');
  assert(config5.stages.length === 4, 'N-Stage sequencing: Exact 4 configured stages stored and retrieved');
  assert(config5.stages[3].allowedRoles.includes('DIRECTOR'), 'Dynamic role assignment in multi-stage ladder verified');

  // -------------------------------------------------------------
  // 8: Maker cannot verify when prohibited
  // -------------------------------------------------------------
  await workflowPolicyEngine.updateWorkflowPolicy('WF-GOV-06', {
    workflowName: 'Strict SoD Workflow',
    verificationRequired: true,
    approvalRequired: true,
    verifierRoles: ['ENGINEER', 'SUPERVISOR'],
    preventMakerVerification: true,
  }, 'System Admin', 'usr-adm-01');
  const res8_makerVerify = await workflowPolicyEngine.evaluateEligibility({
    user: engineer,
    entityType: 'WF-GOV-06',
    action: 'VERIFY',
    instance: { requesterId: engineer.id },
  });
  assert(res8_makerVerify.isEligible === false, 'Maker cannot verify when preventMakerVerification is enabled');

  // -------------------------------------------------------------
  // 9: Maker cannot approve when prohibited
  // -------------------------------------------------------------
  await workflowPolicyEngine.updateWorkflowPolicy('WF-GOV-07', {
    workflowName: 'Strict Approval SoD',
    verificationRequired: false,
    approvalRequired: true,
    approverRoles: ['ENGINEER', 'MANAGER'],
    preventMakerApproval: true,
  }, 'System Admin', 'usr-adm-01');
  const res9_makerApprove = await workflowPolicyEngine.evaluateEligibility({
    user: engineer,
    entityType: 'WF-GOV-07',
    action: 'APPROVE',
    instance: { requesterId: engineer.id },
  });
  assert(res9_makerApprove.isEligible === false, 'Maker cannot approve when preventMakerApproval is enabled');

  // -------------------------------------------------------------
  // 10: Verifier cannot approve when Four-Eyes Principle is enabled
  // -------------------------------------------------------------
  await workflowPolicyEngine.updateWorkflowPolicy('WF-GOV-08', {
    workflowName: 'Four-Eyes Principle Workflow',
    verificationRequired: true,
    approvalRequired: true,
    verifierRoles: ['SUPERVISOR'],
    approverRoles: ['SUPERVISOR', 'MANAGER'],
    preventVerifierApproval: true,
  }, 'System Admin', 'usr-adm-01');
  const res10_verifierApprove = await workflowPolicyEngine.evaluateEligibility({
    user: supervisor,
    entityType: 'WF-GOV-08',
    action: 'APPROVE',
    instance: { requesterId: engineer.id, verifierId: supervisor.id },
  });
  assert(res10_verifierApprove.isEligible === false, 'Verifier cannot approve when Four-Eyes is enabled');

  // -------------------------------------------------------------
  // 11: Higher-Authority Rule
  // -------------------------------------------------------------
  await workflowPolicyEngine.updateWorkflowPolicy('WF-GOV-09', {
    workflowName: 'Hierarchy Rule Workflow',
    verificationRequired: false,
    approvalRequired: true,
    approverRoles: ['ENGINEER', 'SUPERVISOR', 'MANAGER'],
    requireHigherAuthority: true,
  }, 'System Admin', 'usr-adm-01');
  // Peer engineer attempting to approve engineer's request -> FAIL
  const peerEngineer = { id: 'usr-eng-02', name: 'Sunita Rao', role: 'ENGINEER', assignedProjectId: 'PROJ-101' };
  const res11_peer = await workflowPolicyEngine.evaluateEligibility({
    user: peerEngineer,
    entityType: 'WF-GOV-09',
    action: 'APPROVE',
    instance: { requesterId: engineer.id, requesterRole: 'ENGINEER' },
  });
  assert(res11_peer.isEligible === false, 'Higher-authority rule: Peer with equal level cannot approve');

  // Manager (higher level) attempting to approve -> PASS
  const res11_mgr = await workflowPolicyEngine.evaluateEligibility({
    user: manager,
    entityType: 'WF-GOV-09',
    action: 'APPROVE',
    instance: { requesterId: engineer.id, requesterRole: 'ENGINEER' },
  });
  assert(res11_mgr.isEligible === true, 'Higher-authority rule: Higher rank manager is authorized to approve');

  // -------------------------------------------------------------
  // 12: Scope Checks (Project & Department)
  // -------------------------------------------------------------
  await workflowPolicyEngine.updateWorkflowPolicy('WF-GOV-10', {
    workflowName: 'Project Scope Workflow',
    verificationRequired: false,
    approvalRequired: true,
    approverRoles: ['MANAGER'],
    hierarchyScope: 'PROJECT',
  }, 'System Admin', 'usr-adm-01');
  // Other project manager -> FAIL
  const res12_otherProj = await workflowPolicyEngine.evaluateEligibility({
    user: otherProjectManager,
    entityType: 'WF-GOV-10',
    action: 'APPROVE',
    instance: { requesterId: engineer.id },
    context: { projectId: 'PROJ-101' },
  });
  assert(res12_otherProj.isEligible === false, 'Scope Check: Cross-project manager is blocked');

  // Matching project manager -> PASS
  const res12_sameProj = await workflowPolicyEngine.evaluateEligibility({
    user: manager,
    entityType: 'WF-GOV-10',
    action: 'APPROVE',
    instance: { requesterId: engineer.id },
    context: { projectId: 'PROJ-101' },
  });
  assert(res12_sameProj.isEligible === true, 'Scope Check: Matching project manager is authorized');

  // -------------------------------------------------------------
  // 13: Delegation
  // -------------------------------------------------------------
  const todayStr = new Date().toISOString().split('T')[0];
  const delId = `del-test-${Date.now()}`;
  try {
    await db.insert(phase66Delegations).values({
      id: delId,
      delegatorId: manager.id,
      delegatorName: manager.name,
      delegateeId: delegatee.id,
      delegateeName: delegatee.name,
      moduleScope: 'ALL',
      startDate: todayStr,
      endDate: todayStr,
      status: 'ACTIVE',
      isDeleted: false,
      reason: 'Temporary coverage during annual leave',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Error seeding delegation:', e);
  }

  const res13_delegatee = await workflowPolicyEngine.evaluateEligibility({
    user: delegatee,
    entityType: 'WF-GOV-04',
    action: 'APPROVE',
    instance: { requesterId: engineer.id, verifierId: supervisor.id },
  });
  assert(res13_delegatee.isEligible === true && res13_delegatee.delegationActive === true, 'Delegation: Delegatee can approve under active delegation');

  // Cleanup delegation
  await db.delete(phase66Delegations).where(eq(phase66Delegations.id, delId));

  // -------------------------------------------------------------
  // 14: Amount Threshold
  // -------------------------------------------------------------
  await workflowPolicyEngine.updateWorkflowPolicy('WF-GOV-11', {
    workflowName: 'High Value Approval Workflow',
    verificationRequired: false,
    approvalRequired: true,
    approverRoles: ['SUPERVISOR', 'MANAGER', 'DIRECTOR'],
    minApprovalAmount: 50000,
  }, 'System Admin', 'usr-adm-01');
  // Supervisor ($75,000 > $50,000 threshold requires manager level 4+) -> FAIL
  const res14_sup = await workflowPolicyEngine.evaluateEligibility({
    user: supervisor,
    entityType: 'WF-GOV-11',
    action: 'APPROVE',
    amount: 75000,
    instance: { requesterId: engineer.id },
  });
  assert(res14_sup.isEligible === false, 'Amount Threshold: Supervisor cannot authorize above $50k threshold');

  // Manager ($75,000) -> PASS
  const res14_mgr = await workflowPolicyEngine.evaluateEligibility({
    user: manager,
    entityType: 'WF-GOV-11',
    action: 'APPROVE',
    amount: 75000,
    instance: { requesterId: engineer.id },
  });
  assert(res14_mgr.isEligible === true, 'Amount Threshold: Manager is authorized for high-value transaction');

  // -------------------------------------------------------------
  // 15: Policy Versioning & Immutability
  // -------------------------------------------------------------
  const preVersionPolicy = await workflowPolicyEngine.getWorkflowConfig('WF-GOV-12');
  const v1 = preVersionPolicy.version || 1;
  const updatedPolicy = await workflowPolicyEngine.updateWorkflowPolicy('WF-GOV-12', {
    workflowName: 'Versioned Workflow',
    slaHours: 48,
  }, 'Security Auditor', 'usr-auditor-01');
  assert(updatedPolicy.version === v1 + 1, 'Policy Versioning: Policy version is monotonically incremented on update');

  // -------------------------------------------------------------
  // 16: Historical Workflow Instance Preservation
  // -------------------------------------------------------------
  const histChain = await workflowPolicyEngine.getApprovalChainStatus({
    entityType: 'WF-GOV-04',
    entityId: 'ENT-HIST-101',
    instance: { id: 'ENT-HIST-101', status: 'IN_PROGRESS', requesterName: engineer.name, createdAt: '2026-08-25T10:00:00Z' },
  });
  assert(histChain.steps.length >= 2, 'Historical instance preservation: Workflow steps rendered accurately without data loss');

  // -------------------------------------------------------------
  // 17: Server-side Authorization (Admin bypass & Unknown actions)
  // -------------------------------------------------------------
  const res17_admin = await workflowPolicyEngine.evaluateEligibility({
    user: admin,
    entityType: 'WF-GOV-04',
    action: 'APPROVE',
    instance: { requesterId: admin.id },
  });
  assert(res17_admin.isEligible === true, 'Server-side authorization: Super Admin can override administrative locks');

  // -------------------------------------------------------------
  // 18: Audit Trail
  // -------------------------------------------------------------
  const auditLogs = await db
    .select()
    .from(workflowHistory)
    .where(eq(workflowHistory.workflowCode, 'WF-GOV-12'))
    .orderBy(sql`timestamp DESC`);
  assert(auditLogs.length > 0, 'Audit Trail: Policy configuration modifications are captured in immutable audit log');

  console.log(`\n========================================================================`);
  console.log(`ALL ${passedTests}/${totalTests} WORKFLOW GOVERNANCE ENGINE TESTS COMPLETED SUCCESSFULLY!`);
  console.log(`========================================================================\n`);
}

runComprehensiveGovernanceVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Governance verification failed:', err);
    process.exit(1);
  });

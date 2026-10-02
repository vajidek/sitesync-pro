import { db } from '../../db/index';
import { sql, eq, or } from 'drizzle-orm';
import {
  phase66Workflows,
  phase66WorkflowSteps,
  phase66WorkflowInstances,
  phase66WorkflowTasks,
  phase66WorkflowApprovals,
  phase66WorkflowHistory,
  phase66Delegations,
  workflowHistory,
  users,
  roles,
} from '../../db/schema';
import { currencyRepository } from '../repositories/currency.repository';

export interface WorkflowStageConfig {
  stageOrder: number;
  stageName: string;
  stageType: 'CREATION' | 'VERIFICATION' | 'REVIEW' | 'APPROVAL' | 'CLOSURE';
  allowedRoles: string[];
  slaHours: number;
  minAmount?: number;
}

export interface WorkflowGovernancePolicy {
  workflowId: string;
  workflowCode: string;
  workflowName: string;
  module: string;
  version: number;
  isActive: boolean;
  approvalRequired: boolean;
  verificationRequired: boolean;
  reviewRequired: boolean;
  stagesCount: number;
  creatorRoles: string[];
  verifierRoles: string[];
  reviewerRoles: string[];
  approverRoles: string[];
  preventMakerVerification: boolean;
  preventMakerApproval: boolean;
  preventVerifierApproval: boolean;
  requireHigherAuthority?: boolean;
  hierarchyScope: 'PROJECT' | 'SITE' | 'DEPARTMENT' | 'DIVISION' | 'BRANCH' | 'COMPANY' | 'ENTERPRISE';
  matchDepartment?: boolean;
  matchProject?: boolean;
  matchBranch?: boolean;
  delegationAllowed?: boolean;
  minApprovalAmount: number;
  slaHours: number;
  stages: WorkflowStageConfig[];
  updatedAt?: string;
  updatedBy?: string;
}

export interface EligibilityResult {
  isEligible: boolean;
  reason: string;
  workflowCode: string;
  workflowVersion: number;
  approvalRequired: boolean;
  verificationRequired: boolean;
  stagesCount: number;
  currentStage: string;
  nextStage?: string;
  separationOfDutiesPassed: boolean;
  scopeMatchPassed: boolean;
  thresholdPassed: boolean;
  delegationActive?: boolean;
  delegatedBy?: string;
}

export class WorkflowPolicyEngineService {
  private static instance: WorkflowPolicyEngineService;

  public static getInstance(): WorkflowPolicyEngineService {
    if (!WorkflowPolicyEngineService.instance) {
      WorkflowPolicyEngineService.instance = new WorkflowPolicyEngineService();
    }
    return WorkflowPolicyEngineService.instance;
  }

  /**
   * Normalize an entity type or module string to its authoritative workflow code
   */
  public resolveWorkflowCode(entityTypeOrCode: string): string {
    const norm = (entityTypeOrCode || '').toUpperCase().trim();
    if (norm.startsWith('WF-')) return norm;

    if (norm === 'LOAN' || norm === 'HR_LOAN' || norm === 'EMPLOYEE_LOAN') return 'WF-HR-LOAN';
    if (norm === 'ATTENDANCE' || norm === 'ATTENDANCE_FINALIZATION' || norm === 'HR_ATTENDANCE') return 'WF-HR-ATTENDANCE';
    if (norm === 'PAYROLL' || norm === 'PAYROLL_RUN' || norm === 'HR_PAYROLL') return 'WF-HR-PAYROLL';
    if (norm === 'LEAVE' || norm === 'LEAVE_REQUEST' || norm === 'HR_LEAVE') return 'WF-HR-LEAVE';
    if (norm === 'PO' || norm === 'PURCHASE_ORDER' || norm === 'PROC_PO') return 'WF-PROC-PO';
    if (norm === 'MR' || norm === 'REQUISITION' || norm === 'MATERIAL_REQUISITION' || norm === 'MATERIAL_REQUEST' || norm === 'PR' || norm === 'PURCHASE_REQUISITION') return 'WF-PROC-PR';
    if (norm === 'GRN' || norm === 'GOODS_RECEIPT' || norm === 'GOODS_RECEIPT_NOTE' || norm === 'PROC_GRN') return 'WF-PROC-GRN';
    if (norm === 'WO' || norm === 'WORK_ORDER' || norm === 'SUBCONTRACT_WO' || norm === 'SUBCONTRACT_WORK_ORDER' || norm === 'PROC_WO') return 'WF-PROC-WO';
    if (norm === 'INV' || norm === 'INVOICE' || norm === 'FIN_INV') return 'WF-FIN-INV';
    if (norm === 'CASH' || norm === 'PETTY_CASH' || norm === 'FIN_CASH' || norm === 'CASH_REQUEST' || norm === 'PCR' || norm === 'PROJECT_CASH') return 'WF-FIN-CASH';
    if (norm === 'CASH_SETTLEMENT' || norm === 'PCS' || norm === 'FIN_SETTLEMENT') return 'WF-FIN-SETTLEMENT';
    if (norm === 'RA' || norm === 'RA_BILL' || norm === 'COMM_RA' || norm === 'CONTRACTOR_RA') return 'WF-COMM-RA';
    if (norm === 'MATERIAL_ISSUE' || norm === 'MIV' || norm === 'INV_ISSUE') return 'WF-INV-ISSUE';
    if (norm === 'MATERIAL_RETURN' || norm === 'MRT' || norm === 'INV_RETURN') return 'WF-INV-RETURN';
    if (norm === 'INCIDENT' || norm === 'HSE_INCIDENT') return 'WF-HSE-INCIDENT';
    if (norm === 'NCR' || norm === 'QAQC_NCR') return 'WF-QAQC-NCR';

    return `WF-${norm}`;
  }

  /**
   * Retrieves active workflow configuration and governance policy from database
   * with guaranteed safe defaults if not yet customized.
   */
  public async getWorkflowConfig(entityTypeOrCode: string): Promise<WorkflowGovernancePolicy> {
    const workflowCode = this.resolveWorkflowCode(entityTypeOrCode);

    try {
      const res = await db.execute(sql`
        SELECT * FROM phase66_workflows 
        WHERE code = ${workflowCode} 
        LIMIT 1
      `);

      if (res.rows && res.rows.length > 0) {
        const anyWf = res.rows[0] as any;

        // Check if full policy_config JSON exists
        const policyJson = anyWf.policy_config || anyWf.policyConfig;
        if (policyJson) {
          const cfg = typeof policyJson === 'string' ? JSON.parse(policyJson) : policyJson;
          const stages = cfg.stages && cfg.stages.length > 0 ? cfg.stages : this.generateDefaultStages(cfg);
          return {
            workflowId: anyWf.id,
            workflowCode: anyWf.code,
            workflowName: cfg.workflowName || anyWf.name,
            module: cfg.module || anyWf.module,
            version: cfg.version || anyWf.version || 1,
            isActive: cfg.isActive !== undefined ? cfg.isActive : anyWf.is_active !== false,
            approvalRequired: cfg.approvalRequired !== undefined ? cfg.approvalRequired : true,
            verificationRequired: cfg.verificationRequired !== undefined ? cfg.verificationRequired : true,
            reviewRequired: cfg.reviewRequired || false,
            stagesCount: stages.length,
            creatorRoles: cfg.creatorRoles || ['*'],
            verifierRoles: cfg.verifierRoles || ['MANAGER', 'SUPERVISOR', 'INCHARGE'],
            reviewerRoles: cfg.reviewerRoles || ['MANAGER', 'INCHARGE'],
            approverRoles: cfg.approverRoles || ['ADMIN', 'MANAGER', 'DIRECTOR'],
            preventMakerVerification: cfg.preventMakerVerification !== false,
            preventMakerApproval: cfg.preventMakerApproval !== false,
            preventVerifierApproval: cfg.preventVerifierApproval !== false,
            requireHigherAuthority: cfg.requireHigherAuthority === true,
            hierarchyScope: cfg.hierarchyScope || 'PROJECT',
            matchDepartment: cfg.matchDepartment === true,
            matchProject: cfg.matchProject !== false,
            matchBranch: cfg.matchBranch === true,
            delegationAllowed: cfg.delegationAllowed !== false,
            minApprovalAmount: cfg.minApprovalAmount || anyWf.min_approval_amount || 0,
            slaHours: cfg.slaHours || anyWf.sla_hours || 24,
            stages,
            updatedAt: anyWf.updated_at || undefined,
            updatedBy: anyWf.updated_by || undefined,
          };
        }

        // Otherwise parse individual columns
        const verificationRequired = anyWf.verification_required ?? anyWf.verificationRequired ?? true;
        const approvalRequired = anyWf.approval_required ?? anyWf.approvalRequired ?? true;

        let creatorRoles: string[] = ['*'];
        let verifierRoles: string[] = ['MANAGER', 'INCHARGE', 'SUPERVISOR'];
        let reviewerRoles: string[] = ['MANAGER', 'INCHARGE'];
        let approverRoles: string[] = ['ADMIN', 'MANAGER', 'DIRECTOR', 'EXECUTIVE'];

        try {
          if (anyWf.creator_roles || anyWf.creatorRoles) {
            const raw = anyWf.creator_roles || anyWf.creatorRoles;
            creatorRoles = typeof raw === 'string' ? JSON.parse(raw) : raw;
          }
        } catch (e) {}
        try {
          if (anyWf.verifier_roles || anyWf.verifierRoles) {
            const raw = anyWf.verifier_roles || anyWf.verifierRoles;
            verifierRoles = typeof raw === 'string' ? JSON.parse(raw) : raw;
          }
        } catch (e) {}
        try {
          if (anyWf.reviewer_roles || anyWf.reviewerRoles) {
            const raw = anyWf.reviewer_roles || anyWf.reviewerRoles;
            reviewerRoles = typeof raw === 'string' ? JSON.parse(raw) : raw;
          }
        } catch (e) {}
        try {
          if (anyWf.approver_roles || anyWf.approverRoles) {
            const raw = anyWf.approver_roles || anyWf.approverRoles;
            approverRoles = typeof raw === 'string' ? JSON.parse(raw) : raw;
          }
        } catch (e) {}

        const partialCfg = {
          verificationRequired,
          approvalRequired,
          creatorRoles,
          verifierRoles,
          approverRoles,
          slaHours: anyWf.sla_hours || 24,
          minApprovalAmount: anyWf.min_approval_amount || 0,
        };

        const stages = this.generateDefaultStages(partialCfg);

        return {
          workflowId: anyWf.id,
          workflowCode: anyWf.code,
          workflowName: anyWf.name,
          module: anyWf.module,
          version: anyWf.version || 1,
          isActive: anyWf.is_active !== false,
          approvalRequired,
          verificationRequired,
          reviewRequired: stages.length >= 3,
          stagesCount: stages.length,
          creatorRoles,
          verifierRoles,
          reviewerRoles,
          approverRoles,
          preventMakerVerification: anyWf.prevent_maker_verification !== false,
          preventMakerApproval: anyWf.prevent_maker_approval !== false,
          preventVerifierApproval: anyWf.prevent_verifier_approval !== false,
          requireHigherAuthority: anyWf.require_higher_authority === true,
          hierarchyScope: anyWf.hierarchy_scope || 'PROJECT',
          matchDepartment: false,
          matchProject: true,
          matchBranch: false,
          delegationAllowed: true,
          minApprovalAmount: anyWf.min_approval_amount || 0,
          slaHours: anyWf.sla_hours || 24,
          stages,
        };
      }
    } catch (err) {
      console.warn(`Could not load custom workflow for ${workflowCode}, applying safe default policy:`, err);
    }

    // Default Fallback Policy for unconfigured or new transaction types
    return this.getDefaultPolicyForCode(workflowCode);
  }

  /**
   * Helper to generate dynamic stages based on config flags
   */
  private generateDefaultStages(cfg: any): WorkflowStageConfig[] {
    const stages: WorkflowStageConfig[] = [
      {
        stageOrder: 1,
        stageName: 'Creation / Initiation',
        stageType: 'CREATION',
        allowedRoles: cfg.creatorRoles || ['*'],
        slaHours: 8,
      },
    ];

    if (cfg.verificationRequired) {
      stages.push({
        stageOrder: stages.length + 1,
        stageName: 'Verification / Scrutiny',
        stageType: 'VERIFICATION',
        allowedRoles: cfg.verifierRoles || ['SUPERVISOR', 'INCHARGE', 'MANAGER'],
        slaHours: 12,
      });
    }

    if (cfg.approvalRequired) {
      stages.push({
        stageOrder: stages.length + 1,
        stageName: 'Final Approval & Authorization',
        stageType: 'APPROVAL',
        allowedRoles: cfg.approverRoles || ['ADMIN', 'MANAGER', 'DIRECTOR'],
        slaHours: cfg.slaHours || 24,
        minAmount: cfg.minApprovalAmount || 0,
      });
    }

    return stages;
  }

  /**
   * Generates a sensible, safe default policy for standard ERP transaction types
   */
  private getDefaultPolicyForCode(workflowCode: string): WorkflowGovernancePolicy {
    const isHR = workflowCode.includes('HR');
    const isProc = workflowCode.includes('PROC');
    const isFin = workflowCode.includes('FIN');

    const defaultStages: WorkflowStageConfig[] = [
      {
        stageOrder: 1,
        stageName: 'Creation / Initiation',
        stageType: 'CREATION',
        allowedRoles: ['*'],
        slaHours: 8,
      },
      {
        stageOrder: 2,
        stageName: 'Verification / Scrutiny',
        stageType: 'VERIFICATION',
        allowedRoles: ['SUPERVISOR', 'INCHARGE', 'MANAGER'],
        slaHours: 12,
      },
      {
        stageOrder: 3,
        stageName: 'Final Approval & Sign-off',
        stageType: 'APPROVAL',
        allowedRoles: ['ADMIN', 'MANAGER', 'DIRECTOR', 'EXECUTIVE'],
        slaHours: 24,
      },
    ];

    return {
      workflowId: `wf-${workflowCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      workflowCode,
      workflowName: `${workflowCode} Approval Matrix`,
      module: isHR ? 'HR' : isProc ? 'PROCUREMENT' : isFin ? 'FINANCE' : 'GENERAL',
      version: 1,
      isActive: true,
      approvalRequired: true,
      verificationRequired: true,
      reviewRequired: false,
      stagesCount: 3,
      creatorRoles: ['*'],
      verifierRoles: ['SUPERVISOR', 'INCHARGE', 'MANAGER'],
      reviewerRoles: ['MANAGER'],
      approverRoles: ['ADMIN', 'MANAGER', 'DIRECTOR', 'EXECUTIVE'],
      preventMakerVerification: true,
      preventMakerApproval: true,
      preventVerifierApproval: true,
      requireHigherAuthority: false,
      hierarchyScope: 'PROJECT',
      matchDepartment: false,
      matchProject: true,
      matchBranch: false,
      delegationAllowed: true,
      minApprovalAmount: 0,
      slaHours: 24,
      stages: defaultStages,
    };
  }

  /**
   * Updates an existing workflow policy with admin configuration and bumps version
   */
  public async updateWorkflowPolicy(
    workflowCodeOrId: string,
    policyUpdates: Partial<WorkflowGovernancePolicy>,
    updatedBy: string,
    updatedByUserId?: string
  ): Promise<WorkflowGovernancePolicy> {
    const actorName = String(updatedBy || '').trim();
    const actorId = String(updatedByUserId || '').trim();
    if (!actorName || !actorId) {
      throw new Error('Authenticated workflow policy administrator identity is required.');
    }
    const now = new Date().toISOString();
    const workflowCode = this.resolveWorkflowCode(workflowCodeOrId);

    // Fetch existing or seed
    const existing = await this.getWorkflowConfig(workflowCode);
    const newVersion = (existing.version || 1) + 1;

    // Merge stages dynamically if provided
    let updatedStages = policyUpdates.stages;
    if (!updatedStages || updatedStages.length === 0) {
      updatedStages = this.generateDefaultStages({
        ...existing,
        ...policyUpdates,
      });
    }

    const mergedPolicy: WorkflowGovernancePolicy = {
      workflowId: existing.workflowId,
      workflowCode,
      workflowName: policyUpdates.workflowName || existing.workflowName,
      module: policyUpdates.module || existing.module,
      version: newVersion,
      isActive: policyUpdates.isActive !== undefined ? policyUpdates.isActive : existing.isActive,
      approvalRequired: policyUpdates.approvalRequired !== undefined ? policyUpdates.approvalRequired : existing.approvalRequired,
      verificationRequired: policyUpdates.verificationRequired !== undefined ? policyUpdates.verificationRequired : existing.verificationRequired,
      reviewRequired: policyUpdates.reviewRequired !== undefined ? policyUpdates.reviewRequired : existing.reviewRequired,
      stagesCount: updatedStages.length,
      creatorRoles: policyUpdates.creatorRoles || existing.creatorRoles,
      verifierRoles: policyUpdates.verifierRoles || existing.verifierRoles,
      reviewerRoles: policyUpdates.reviewerRoles || existing.reviewerRoles,
      approverRoles: policyUpdates.approverRoles || existing.approverRoles,
      preventMakerVerification: policyUpdates.preventMakerVerification !== undefined ? policyUpdates.preventMakerVerification : existing.preventMakerVerification,
      preventMakerApproval: policyUpdates.preventMakerApproval !== undefined ? policyUpdates.preventMakerApproval : existing.preventMakerApproval,
      preventVerifierApproval: policyUpdates.preventVerifierApproval !== undefined ? policyUpdates.preventVerifierApproval : existing.preventVerifierApproval,
      requireHigherAuthority: policyUpdates.requireHigherAuthority !== undefined ? policyUpdates.requireHigherAuthority : existing.requireHigherAuthority,
      hierarchyScope: policyUpdates.hierarchyScope || existing.hierarchyScope,
      matchDepartment: policyUpdates.matchDepartment !== undefined ? policyUpdates.matchDepartment : existing.matchDepartment,
      matchProject: policyUpdates.matchProject !== undefined ? policyUpdates.matchProject : existing.matchProject,
      matchBranch: policyUpdates.matchBranch !== undefined ? policyUpdates.matchBranch : existing.matchBranch,
      delegationAllowed: policyUpdates.delegationAllowed !== undefined ? policyUpdates.delegationAllowed : existing.delegationAllowed,
      minApprovalAmount: policyUpdates.minApprovalAmount !== undefined ? policyUpdates.minApprovalAmount : existing.minApprovalAmount,
      slaHours: policyUpdates.slaHours !== undefined ? policyUpdates.slaHours : existing.slaHours,
      stages: updatedStages,
      updatedAt: now,
      updatedBy: actorName,
    };

    const policyJsonString = JSON.stringify(mergedPolicy);

    try {
      // Upsert into phase66Workflows
      const exists = await db.select().from(phase66Workflows).where(eq(phase66Workflows.code, workflowCode)).limit(1);
      if (exists.length > 0) {
        await db.execute(sql`
          UPDATE phase66_workflows
          SET name = ${mergedPolicy.workflowName},
              module = ${mergedPolicy.module},
              version = ${mergedPolicy.version},
              is_active = ${mergedPolicy.isActive},
              min_approval_amount = ${mergedPolicy.minApprovalAmount},
              sla_hours = ${mergedPolicy.slaHours},
              policy_config = ${policyJsonString}::jsonb,
              verification_required = ${mergedPolicy.verificationRequired},
              approval_required = ${mergedPolicy.approvalRequired},
              prevent_maker_verification = ${mergedPolicy.preventMakerVerification},
              prevent_maker_approval = ${mergedPolicy.preventMakerApproval},
              prevent_verifier_approval = ${mergedPolicy.preventVerifierApproval},
              require_higher_authority = ${mergedPolicy.requireHigherAuthority},
              hierarchy_scope = ${mergedPolicy.hierarchyScope},
              updated_at = ${now},
              updated_by = ${actorName}
          WHERE code = ${workflowCode}
        `);
      } else {
        await db.insert(phase66Workflows).values({
          id: existing.workflowId,
          code: workflowCode,
          name: mergedPolicy.workflowName,
          module: mergedPolicy.module,
          version: mergedPolicy.version,
          isActive: mergedPolicy.isActive,
          minApprovalAmount: mergedPolicy.minApprovalAmount,
          slaHours: mergedPolicy.slaHours,
          createdAt: now,
          updatedAt: now,
          createdBy: updatedBy,
          updatedBy: actorName,
        });

        await db.execute(sql`
          UPDATE phase66_workflows
          SET policy_config = ${policyJsonString}::jsonb,
              verification_required = ${mergedPolicy.verificationRequired},
              approval_required = ${mergedPolicy.approvalRequired},
              prevent_maker_verification = ${mergedPolicy.preventMakerVerification},
              prevent_maker_approval = ${mergedPolicy.preventMakerApproval},
              prevent_verifier_approval = ${mergedPolicy.preventVerifierApproval},
              require_higher_authority = ${mergedPolicy.requireHigherAuthority},
              hierarchy_scope = ${mergedPolicy.hierarchyScope}
          WHERE code = ${workflowCode}
        `);
      }

      // Record in audit log
      await db.insert(workflowHistory).values({
        id: `audit-wf-${Date.now()}`,
        workflowCode,
        entityType: 'WORKFLOW_CONFIG',
        entityId: workflowCode,
        fromState: `VERSION_${existing.version}`,
        toState: `VERSION_${newVersion}`,
        actionTaken: 'UPDATE_POLICY',
        performedByUserId: actorId,
        performedByUserName: actorName,
        performedByUserRole: 'ADMIN',
        department: 'Governance',
        comments: `Admin updated approval policy for ${workflowCode}: Verification=${mergedPolicy.verificationRequired}, Approval=${mergedPolicy.approvalRequired}, Stages=${mergedPolicy.stages.length}, MakerChecker=${mergedPolicy.preventMakerApproval}`,
        timestamp: now,
      });
    } catch (err) {
      console.error('Error updating workflow policy in database:', err);
    }

    return mergedPolicy;
  }

  /**
   * Dynamic evaluation of whether a given user can perform an action on an entity
   */
  public async evaluateEligibility(params: {
    user: any;
    entityType: string;
    action: 'INITIATE' | 'VERIFY' | 'REVIEW' | 'APPROVE' | 'REJECT' | 'RETURN';
    instance?: any;
    context?: any;
    amount?: number;
  }): Promise<EligibilityResult> {
    const { user, entityType, action, instance, context } = params;
    const policy = await this.getWorkflowConfig(entityType);

    const userRoleCode = String(user?.role || user?.roleCode || user?.roleId || '').trim().toUpperCase();
    const userId = String(user?.id || user?.userId || '').trim();
    const userName = String(user?.name || user?.email || '').trim();

    if (!userId || !userName || !userRoleCode) {
      throw new Error('Authenticated workflow actor identity (id, name and role) is required.');
    }

    // 1. If Workflow is disabled OR both Verification and Approval are OFF (Test A)
    if (!policy.isActive || (!policy.verificationRequired && !policy.approvalRequired)) {
      return {
        isEligible: true,
        reason: 'Workflow governance gate is toggled OFF by Admin policy. Direct execution permitted.',
        workflowCode: policy.workflowCode,
        workflowVersion: policy.version,
        approvalRequired: false,
        verificationRequired: false,
        stagesCount: 1,
        currentStage: 'DIRECT_EXECUTION',
        separationOfDutiesPassed: true,
        scopeMatchPassed: true,
        thresholdPassed: true,
      };
    }

    // 2. Check Active Delegation
    let delegationActive = false;
    let delegatedBy: string | undefined;
    const nowStr = new Date().toISOString().split('T')[0];
    try {
      const activeDels = await db.select().from(phase66Delegations).where(
        sql`status = 'ACTIVE' AND is_deleted = false AND delegatee_id = ${userId} AND start_date <= ${nowStr} AND end_date >= ${nowStr}`
      );
      if (activeDels.length > 0) {
        const matchingDel = activeDels.find(
          (d) => d.moduleScope === 'ALL' || d.moduleScope === policy.module || d.moduleScope === policy.workflowCode
        );
        if (matchingDel) {
          delegationActive = true;
          delegatedBy = matchingDel.delegatorName;
        }
      }
    } catch (e) {}

    // Check Role Inclusion helper
    const roleMatches = (allowedList: string[]) => {
      if (userRoleCode === 'ADMIN' || userRoleCode === 'SUPER_ADMIN') return true;
      if (delegationActive) return true;
      if (allowedList.includes('*')) return true;
      const cleanUserRole = userRoleCode.toUpperCase().replace(/[^A-Z]/g, '');
      return allowedList.some((r) => {
        const cleanAllowed = r.toUpperCase().replace(/[^A-Z]/g, '');
        if (cleanAllowed === cleanUserRole) return true;
        if (cleanAllowed === 'MANAGER' && cleanUserRole.includes('MANAGER')) return true;
        if (cleanAllowed === 'DIRECTOR' && cleanUserRole.includes('DIRECTOR')) return true;
        if (cleanAllowed === 'INCHARGE' && cleanUserRole.includes('INCHARGE')) return true;
        if (cleanAllowed === 'SUPERVISOR' && (
          cleanUserRole.includes('SUPERVISOR') ||
          cleanUserRole.includes('SURVEYOR') ||
          cleanUserRole.includes('ENGINEER') ||
          cleanUserRole.includes('QS') ||
          cleanUserRole.includes('INSPECTOR')
        )) return true;
        if (cleanUserRole.includes(cleanAllowed)) return true;
        return false;
      });
    };

    // 3. Action Specific Evaluation
    if (action === 'INITIATE') {
      const canInitiate = roleMatches(policy.creatorRoles);
      return {
        isEligible: canInitiate,
        reason: canInitiate
          ? `Authorized to initiate ${policy.workflowName}`
          : `Role '${userRoleCode}' is not authorized to create requests of type ${policy.workflowName}. Allowed roles: ${policy.creatorRoles.join(', ')}`,
        workflowCode: policy.workflowCode,
        workflowVersion: policy.version,
        approvalRequired: policy.approvalRequired,
        verificationRequired: policy.verificationRequired,
        stagesCount: policy.stagesCount,
        currentStage: 'INITIATION',
        nextStage: policy.verificationRequired ? 'VERIFICATION' : 'APPROVAL',
        separationOfDutiesPassed: true,
        scopeMatchPassed: true,
        thresholdPassed: true,
        delegationActive,
        delegatedBy,
      };
    }

    const requesterId = instance?.requesterId || instance?.createdByUserId || instance?.userId || instance?.makerUserId || context?.requesterId;
    const verifierId = instance?.verifierId || instance?.verifiedByUserId || context?.verifierId;

    // Separation of Duties: Self-Action Guard
    const isMaker = requesterId && requesterId === userId;
    const isVerifier = verifierId && verifierId === userId;

    if (action === 'VERIFY') {
      if (!policy.verificationRequired) {
        return {
          isEligible: false,
          reason: 'Verification stage is disabled by Admin policy for this workflow.',
          workflowCode: policy.workflowCode,
          workflowVersion: policy.version,
          approvalRequired: policy.approvalRequired,
          verificationRequired: false,
          stagesCount: policy.stagesCount,
          currentStage: 'VERIFICATION',
          separationOfDutiesPassed: false,
          scopeMatchPassed: true,
          thresholdPassed: true,
        };
      }

      if (policy.preventMakerVerification && isMaker && userRoleCode !== 'ADMIN') {
        return {
          isEligible: false,
          reason: 'Separation of Duties Enforced: You created this request and cannot perform verification on your own submission.',
          workflowCode: policy.workflowCode,
          workflowVersion: policy.version,
          approvalRequired: policy.approvalRequired,
          verificationRequired: true,
          stagesCount: policy.stagesCount,
          currentStage: 'VERIFICATION',
          separationOfDutiesPassed: false,
          scopeMatchPassed: true,
          thresholdPassed: true,
        };
      }

      const roleAllowed = roleMatches(policy.verifierRoles);
      return {
        isEligible: roleAllowed,
        reason: roleAllowed
          ? delegationActive
            ? `Authorized to verify via delegation from ${delegatedBy}`
            : `Authorized as Verifier with role '${userRoleCode}'`
          : `Role '${userRoleCode}' is not eligible to verify. Configured Verifier roles: ${policy.verifierRoles.join(', ')}`,
        workflowCode: policy.workflowCode,
        workflowVersion: policy.version,
        approvalRequired: policy.approvalRequired,
        verificationRequired: true,
        stagesCount: policy.stagesCount,
        currentStage: 'VERIFICATION',
        nextStage: 'APPROVAL',
        separationOfDutiesPassed: true,
        scopeMatchPassed: true,
        thresholdPassed: true,
        delegationActive,
        delegatedBy,
      };
    }

    if (action === 'APPROVE' || action === 'REJECT' || action === 'RETURN') {
      if (!policy.approvalRequired) {
        return {
          isEligible: true,
          reason: 'Approval requirement is toggled OFF by Admin. Direct processing enabled.',
          workflowCode: policy.workflowCode,
          workflowVersion: policy.version,
          approvalRequired: false,
          verificationRequired: policy.verificationRequired,
          stagesCount: policy.stagesCount,
          currentStage: 'APPROVAL',
          separationOfDutiesPassed: true,
          scopeMatchPassed: true,
          thresholdPassed: true,
        };
      }

      // Check Maker cannot approve
      if (policy.preventMakerApproval && isMaker && userRoleCode !== 'ADMIN') {
        return {
          isEligible: false,
          reason: 'Separation of Duties Enforced: You initiated this transaction and cannot grant final approval to your own request.',
          workflowCode: policy.workflowCode,
          workflowVersion: policy.version,
          approvalRequired: true,
          verificationRequired: policy.verificationRequired,
          stagesCount: policy.stagesCount,
          currentStage: 'APPROVAL',
          separationOfDutiesPassed: false,
          scopeMatchPassed: true,
          thresholdPassed: true,
        };
      }

      // Check Verifier cannot approve
      if (policy.preventVerifierApproval && isVerifier && userRoleCode !== 'ADMIN') {
        return {
          isEligible: false,
          reason: 'Separation of Duties Enforced: You performed the verification step and cannot act as the final approver for this transaction.',
          workflowCode: policy.workflowCode,
          workflowVersion: policy.version,
          approvalRequired: true,
          verificationRequired: policy.verificationRequired,
          stagesCount: policy.stagesCount,
          currentStage: 'APPROVAL',
          separationOfDutiesPassed: false,
          scopeMatchPassed: true,
          thresholdPassed: true,
        };
      }

      // Check Approver Role
      const roleAllowed = roleMatches(policy.approverRoles);
      if (!roleAllowed) {
        return {
          isEligible: false,
          reason: `Role '${userRoleCode}' is not in the configured Approver matrix for ${policy.workflowName}. Configured Approvers: ${policy.approverRoles.join(', ')}`,
          workflowCode: policy.workflowCode,
          workflowVersion: policy.version,
          approvalRequired: true,
          verificationRequired: policy.verificationRequired,
          stagesCount: policy.stagesCount,
          currentStage: 'APPROVAL',
          separationOfDutiesPassed: true,
          scopeMatchPassed: true,
          thresholdPassed: true,
          delegationActive,
          delegatedBy,
        };
      }

      // Helper to compute role hierarchy level
      const getRoleLevel = (roleCode: string): number => {
        const clean = roleCode.toUpperCase().replace(/[^A-Z]/g, '');
        if (clean.includes('ADMIN')) return 6;
        if (clean.includes('DIRECTOR') || clean.includes('EXECUTIVE') || clean.includes('PRESIDENT') || clean.includes('VP') || clean.includes('CHIEF') || clean.includes('CEO') || clean.includes('CFO') || clean.includes('GM')) return 5;
        if (clean.includes('MANAGER') || clean.includes('LEAD') || clean.includes('HEAD')) return 4;
        if (clean.includes('SUPERVISOR') || clean.includes('INCHARGE') || clean.includes('AUDITOR')) return 3;
        if (clean.includes('ENGINEER') || clean.includes('SURVEYOR') || clean.includes('QS') || clean.includes('OFFICER') || clean.includes('STORE') || clean.includes('CLERK') || clean.includes('BUYER') || clean.includes('ACCOUNTANT')) return 2;
        return 1;
      };

      // Check Higher Authority Rule
      if (policy.requireHigherAuthority && userRoleCode !== 'ADMIN') {
        const makerRole = (instance?.requesterRole || instance?.creatorRole || context?.requesterRole || '').toUpperCase();
        if (makerRole) {
          const approverLevel = getRoleLevel(userRoleCode);
          const makerLevel = getRoleLevel(makerRole);
          if (approverLevel <= makerLevel) {
            return {
              isEligible: false,
              reason: `Higher Authority Rule Enforced: Approver role level (${userRoleCode} = L${approverLevel}) must exceed Initiator role level (${makerRole} = L${makerLevel}).`,
              workflowCode: policy.workflowCode,
              workflowVersion: policy.version,
              approvalRequired: true,
              verificationRequired: policy.verificationRequired,
              stagesCount: policy.stagesCount,
              currentStage: 'APPROVAL',
              separationOfDutiesPassed: true,
              scopeMatchPassed: true,
              thresholdPassed: true,
            };
          }
        }
      }

      // Check configured amount threshold only.
      // Monetary limits must come from workflow configuration, not application code.
      const txnAmount = params.amount ?? instance?.amount ?? context?.amount;
      if (txnAmount !== undefined && policy.minApprovalAmount > 0) {
        const approverLevel = getRoleLevel(userRoleCode);
        if (txnAmount > policy.minApprovalAmount && approverLevel < 4 && userRoleCode !== 'ADMIN') {
          return {
            isEligible: false,
            reason: 'Configured approval threshold exceeded for workflow ' + policy.workflowCode + '. Transaction amount: ' + txnAmount.toLocaleString() + '.',
            workflowCode: policy.workflowCode,
            workflowVersion: policy.version,
            approvalRequired: true,
            verificationRequired: policy.verificationRequired,
            stagesCount: policy.stagesCount,
            currentStage: 'APPROVAL',
            separationOfDutiesPassed: true,
            scopeMatchPassed: true,
            thresholdPassed: false,
          };
        }
      }
      // Check Scope (Project / Department / Site)
      if (policy.hierarchyScope === 'PROJECT' && context?.projectId && user?.assignedProjectId) {
        if (context.projectId !== user.assignedProjectId && userRoleCode !== 'ADMIN') {
          return {
            isEligible: false,
            reason: `Scope Mismatch: Your assigned project (${user.assignedProjectId}) does not match the transaction project (${context.projectId}).`,
            workflowCode: policy.workflowCode,
            workflowVersion: policy.version,
            approvalRequired: true,
            verificationRequired: policy.verificationRequired,
            stagesCount: policy.stagesCount,
            currentStage: 'APPROVAL',
            separationOfDutiesPassed: true,
            scopeMatchPassed: false,
            thresholdPassed: true,
          };
        }
      } else if (policy.hierarchyScope === 'DEPARTMENT' && (context?.department || instance?.department) && user?.department) {
        const txnDept = context?.department || instance?.department;
        if (txnDept !== user.department && userRoleCode !== 'ADMIN') {
          return {
            isEligible: false,
            reason: `Scope Mismatch: Your assigned department (${user.department}) does not match the transaction department (${txnDept}).`,
            workflowCode: policy.workflowCode,
            workflowVersion: policy.version,
            approvalRequired: true,
            verificationRequired: policy.verificationRequired,
            stagesCount: policy.stagesCount,
            currentStage: 'APPROVAL',
            separationOfDutiesPassed: true,
            scopeMatchPassed: false,
            thresholdPassed: true,
          };
        }
      }

      return {
        isEligible: true,
        reason: delegationActive
          ? `Authorized for final approval via active delegation from ${delegatedBy}`
          : `Authorized Approver: Matches role '${userRoleCode}' for scope [${policy.hierarchyScope}]`,
        workflowCode: policy.workflowCode,
        workflowVersion: policy.version,
        approvalRequired: true,
        verificationRequired: policy.verificationRequired,
        stagesCount: policy.stagesCount,
        currentStage: 'APPROVAL',
        nextStage: 'CLOSED',
        separationOfDutiesPassed: true,
        scopeMatchPassed: true,
        thresholdPassed: true,
        delegationActive,
        delegatedBy,
      };
    }

    return {
      isEligible: false,
      reason: `Unknown action '${action}'`,
      workflowCode: policy.workflowCode,
      workflowVersion: policy.version,
      approvalRequired: policy.approvalRequired,
      verificationRequired: policy.verificationRequired,
      stagesCount: policy.stagesCount,
      currentStage: 'UNKNOWN',
      separationOfDutiesPassed: false,
      scopeMatchPassed: false,
      thresholdPassed: false,
    };
  }

  /**
   * Builds the complete visual approval chain for rendering in the universal widget
   */
  public async getApprovalChainStatus(params: {
    entityType: string;
    entityId: string;
    instance?: any;
    currentUser?: any;
  }) {
    const { entityType, entityId, instance, currentUser } = params;
    const policy = await this.getWorkflowConfig(entityType);

    // Fetch history for this entity
    let history: any[] = [];
    try {
      history = await db
        .select()
        .from(workflowHistory)
        .where(sql`entity_id = ${entityId} OR entity_id = ${instance?.id || entityId}`)
        .orderBy(workflowHistory.timestamp);
    } catch (e) {}

    const status = (instance?.status || 'PENDING').toUpperCase();

    // Map stages to step items
    const steps: Array<{
      order: number;
      name: string;
      roleTarget: string;
      status: 'COMPLETED' | 'CURRENT' | 'PENDING' | 'REJECTED' | 'RETURNED' | 'SKIPPED';
      actorName?: string;
      actorRole?: string;
      timestamp?: string;
      remarks?: string;
    }> = [];

    // Step 1: Initiation
    const initAction = history.find((h) => h.actionTaken === 'SUBMIT' || h.fromState === 'DRAFT');
    steps.push({
      order: 1,
      name: 'Initiation',
      roleTarget: policy.creatorRoles.join(', '),
      status: 'COMPLETED',
      actorName: initAction?.performedByUserName || instance?.requesterName || 'Requester',
      actorRole: initAction?.performedByUserRole || 'INITIATOR',
      timestamp: initAction?.timestamp || instance?.createdAt,
      remarks: initAction?.comments || 'Request initiated',
    });

    // Step 2: Verification (if required)
    if (policy.verificationRequired) {
      const verifyAction = history.find(
        (h) => h.actionTaken === 'VERIFY' || h.toState === 'VERIFIED' || h.actionTaken === 'VERIFIED'
      );
      let stepStatus: 'COMPLETED' | 'CURRENT' | 'PENDING' | 'REJECTED' | 'RETURNED' = 'PENDING';
      if (verifyAction) {
        stepStatus = 'COMPLETED';
      } else if (status === 'IN_PROGRESS' || status === 'IN_REVIEW' || status === 'PENDING' || status === 'SUBMITTED') {
        stepStatus = 'CURRENT';
      } else if (status === 'REJECTED') {
        stepStatus = 'REJECTED';
      }

      steps.push({
        order: 2,
        name: 'Verification',
        roleTarget: policy.verifierRoles.join(', '),
        status: stepStatus,
        actorName: verifyAction?.performedByUserName,
        actorRole: verifyAction?.performedByUserRole,
        timestamp: verifyAction?.timestamp,
        remarks: verifyAction?.comments,
      });
    }

    // Step 3: Final Approval
    const approveAction = history.find(
      (h) => h.actionTaken === 'APPROVED' || h.toState === 'APPROVED' || h.actionTaken === 'APPROVE'
    );
    const rejectAction = history.find((h) => h.actionTaken === 'REJECTED' || h.actionTaken === 'REJECT');
    const returnAction = history.find(
      (h) => h.actionTaken === 'RETURN_FOR_CORRECTION' || h.actionTaken === 'REVISION_REQUESTED'
    );

    let finalStatus: 'COMPLETED' | 'CURRENT' | 'PENDING' | 'REJECTED' | 'RETURNED' = 'PENDING';
    if (approveAction || status === 'APPROVED' || status === 'DISBURSED' || status === 'CLOSED') {
      finalStatus = 'COMPLETED';
    } else if (rejectAction || status === 'REJECTED') {
      finalStatus = 'REJECTED';
    } else if (returnAction || status === 'RETURNED') {
      finalStatus = 'RETURNED';
    } else if (steps.every((s) => s.status === 'COMPLETED')) {
      finalStatus = 'CURRENT';
    }

    steps.push({
      order: steps.length + 1,
      name: 'Final Approval',
      roleTarget: policy.approverRoles.join(', '),
      status: finalStatus,
      actorName: approveAction?.performedByUserName || rejectAction?.performedByUserName || returnAction?.performedByUserName,
      actorRole: approveAction?.performedByUserRole || rejectAction?.performedByUserRole || returnAction?.performedByUserRole,
      timestamp: approveAction?.timestamp || rejectAction?.timestamp || returnAction?.timestamp,
      remarks: approveAction?.comments || rejectAction?.comments || returnAction?.comments,
    });

    // Check user eligibility for current stage
    let userEvaluation: EligibilityResult | null = null;
    if (currentUser) {
      const currentStep = steps.find((s) => s.status === 'CURRENT') || steps[steps.length - 1];
      const targetAction = currentStep.name === 'Verification' ? 'VERIFY' : 'APPROVE';
      userEvaluation = await this.evaluateEligibility({
        user: currentUser,
        entityType,
        action: targetAction,
        instance,
      });
    }

    return {
      policy,
      steps,
      currentStatus: status,
      history,
      userEvaluation,
    };
  }
}

export const workflowPolicyEngine = WorkflowPolicyEngineService.getInstance();

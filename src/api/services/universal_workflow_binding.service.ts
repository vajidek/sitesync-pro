import { workflowRepository } from '../repositories/workflow.repository';
import { workflowPolicyEngine, EligibilityResult } from './workflowPolicyEngine.service';
import { enterpriseAuditRepository, StandardAuditEventType } from '../repositories/enterprise_audit.repository';
import { db } from '../../db';
import { phase66WorkflowInstances, phase66WorkflowTasks, workflowHistory } from '../../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { logger } from '../utils/logger';

export interface WorkflowBindParams {
  entityType: string;
  entityId: string;
  entityNumber?: string;
  title: string;
  amount?: number;
  currency?: string;
  projectId?: string;
  department?: string;
  requester: {
    id: string;
    name: string;
    email?: string;
    role?: string;
  };
  dataContext?: Record<string, any>;
  idempotencyKey?: string;
}

export interface WorkflowTransitionParams {
  entityType: string;
  entityId: string;
  entityNumber?: string;
  action: 'SUBMIT' | 'VERIFY' | 'APPROVE' | 'REJECT' | 'RETURN' | 'CANCEL' | 'DISBURSE' | 'SETTLE' | 'CLOSE' | string;
  user: {
    id: string;
    name: string;
    email?: string;
    role?: string;
    assignedProjectId?: string;
    department?: string;
  };
  remarks?: string;
  digitalSignature?: string;
  idempotencyKey?: string;
  additionalMetadata?: Record<string, any>;
  amount?: number;
}

export class UniversalWorkflowBindingService {
  private static instance: UniversalWorkflowBindingService;

  public static getInstance(): UniversalWorkflowBindingService {
    if (!UniversalWorkflowBindingService.instance) {
      UniversalWorkflowBindingService.instance = new UniversalWorkflowBindingService();
    }
    return UniversalWorkflowBindingService.instance;
  }

  /**
   * Binds an operational transaction to the Universal Workflow Engine.
   * Creates workflow instance, initial task, and logs enterprise audit event.
   */
  public async bindOperationalTransaction(params: WorkflowBindParams) {
    const requesterId = String(params.requester?.id || '').trim();
    const requesterName = String(params.requester?.name || '').trim();
    const requesterRole = String(params.requester?.role || '').trim();
    const companyId = String((params.dataContext as any)?.companyId || '').trim();

    if (!requesterId || !requesterName || !requesterRole) {
      throw new Error('Authenticated workflow requester identity (id, name and role) is required.');
    }
    if (!companyId) {
      throw new Error('Company context is required to bind an operational transaction to workflow.');
    }
    const workflowCode = workflowPolicyEngine.resolveWorkflowCode(params.entityType);
    const policy = await workflowPolicyEngine.getWorkflowConfig(workflowCode);

    const mergedContext = {
      ...(params.dataContext || {}),
      entityNumber: params.entityNumber,
      projectId: params.projectId || (params.dataContext as any)?.projectId,
      department: params.department || (params.dataContext as any)?.department,
      requesterRole,
      requesterId,
      requesterEmail: params.requester.email,
      idempotencyKey: params.idempotencyKey,
      policyVersion: policy.version,
    };

    // Submit instance to workflow engine
    const submitResult = await workflowRepository.submitWorkflowInstance(
      {
        workflowCode,
        entityType: params.entityType.toUpperCase(),
        entityId: params.entityId,
        title: params.title,
        amount: params.amount || 0,
        currency: params.currency || 'INR',
        projectId: params.projectId,
        department: params.department,
        dataContextJson: mergedContext,
      },
      params.requester
    );

    // Record Enterprise Audit Event
    await enterpriseAuditRepository.logEvent({
      companyId,
      userId: requesterId,
      userEmail: params.requester.email,
      userRole: params.requester.role,
      userName: requesterName,
      actionType: 'SUBMIT',
      entityType: params.entityType.toUpperCase(),
      entityId: params.entityId,
      entityNumber: params.entityNumber,
      fromState: 'DRAFT',
      toState: submitResult.instance.status,
      diffJson: {
        amount: params.amount,
        currency: params.currency,
        projectId: params.projectId,
      },
      metadata: mergedContext,
      reason: `Submitted for workflow verification and approval under ${policy.workflowName}`,
      idempotencyKey: params.idempotencyKey,
      workflowInstanceId: submitResult.instance.id,
      workflowTaskId: submitResult.task.id,
    });

    return {
      workflowCode,
      policy,
      instance: submitResult.instance,
      task: submitResult.task,
    };
  }

  /**
   * Evaluates eligibility with Separation of Duties, Scope matching, and Thresholds.
   */
  public async evaluateEligibility(params: {
    user: {
      id: string;
      name: string;
      role?: string;
      assignedProjectId?: string;
      department?: string;
    };
    entityType: string;
    action: 'VERIFY' | 'APPROVE' | 'REJECT' | 'RETURN';
    entityId?: string;
    instanceId?: string;
    amount?: number;
    projectId?: string;
    department?: string;
    requesterId?: string;
    verifierId?: string;
  }): Promise<EligibilityResult> {
    const workflowCode = workflowPolicyEngine.resolveWorkflowCode(params.entityType);

    // Fetch active instance if exists
    let instance: any = null;
    if (params.instanceId) {
      const rows = await db.select().from(phase66WorkflowInstances).where(eq(phase66WorkflowInstances.id, params.instanceId)).limit(1);
      instance = rows[0];
    } else if (params.entityId) {
      const rows = await db
        .select()
        .from(phase66WorkflowInstances)
        .where(
          and(
            eq(phase66WorkflowInstances.entityType, params.entityType.toUpperCase()),
            eq(phase66WorkflowInstances.entityId, params.entityId)
          )
        )
        .orderBy(sql`created_at DESC`)
        .limit(1);
      instance = rows[0];
    }

    let parsedContext: any = {};
    if (instance?.dataContextJson) {
      try {
        parsedContext = JSON.parse(instance.dataContextJson);
      } catch (e) {}
    }

    const context = {
      projectId: params.projectId || instance?.projectId || parsedContext.projectId,
      department: params.department || instance?.department || parsedContext.department,
      amount: params.amount ?? parsedContext.originalAmount ?? instance?.amount,
      requesterId: params.requesterId || instance?.requesterId || parsedContext.requesterId,
      requesterRole: parsedContext.requesterRole,
      verifierId: params.verifierId || parsedContext.verifierId,
    };

    return await workflowPolicyEngine.evaluateEligibility({
      user: params.user,
      entityType: workflowCode,
      action: params.action,
      instance,
      context,
      amount: params.amount,
    });
  }

  /**
   * Executes a workflow transition with strict Maker-Checker and Governance validation.
   */
  public async executeWorkflowTransition(params: WorkflowTransitionParams) {
    const actorId = String(params.user?.id || '').trim();
    const actorName = String(params.user?.name || '').trim();
    const actorRole = String(params.user?.role || '').trim();

    if (!actorId || !actorName || !actorRole) {
      throw new Error('Authenticated workflow actor identity (id, name and role) is required.');
    }
    const workflowCode = workflowPolicyEngine.resolveWorkflowCode(params.entityType);
    const policy = await workflowPolicyEngine.getWorkflowConfig(workflowCode);

    // Locate active instance and task
    const instRows = await db
      .select()
      .from(phase66WorkflowInstances)
      .where(
        and(
          eq(phase66WorkflowInstances.entityType, params.entityType.toUpperCase()),
          eq(phase66WorkflowInstances.entityId, params.entityId)
        )
      )
      .orderBy(sql`created_at DESC`)
      .limit(1);

    const instance = instRows[0];
    if (!instance) {
      throw new Error('Workflow instance not found. Submit the transaction to workflow before requesting a transition.');
    }
    let parsedContext: any = {};
    if (instance?.dataContextJson) {
      try {
        parsedContext = JSON.parse(instance.dataContextJson);
      } catch (e) {}
    }

    // Determine normalized action
    const actionUpper = params.action.toUpperCase();

    // 1. Separation of Duties & Eligibility Validation
    if (['VERIFY', 'APPROVE', 'REJECT', 'RETURN'].includes(actionUpper)) {
      const evalResult = await this.evaluateEligibility({
        user: params.user,
        entityType: params.entityType,
        action: actionUpper as any,
        entityId: params.entityId,
        instanceId: instance?.id,
        amount: params.amount ?? parsedContext.originalAmount,
        projectId: parsedContext.projectId,
        department: parsedContext.department,
        requesterId: instance?.requesterId || parsedContext.requesterId,
        verifierId: parsedContext.verifierId,
      });

      if (!evalResult.isEligible) {
        throw new Error(`Governance Rule Violation: ${evalResult.reason}`);
      }
    }

    // 2. Stage Progression & State Calculation
    const fromState = instance?.status || 'SUBMITTED';
    let toState = fromState;
    let decisionCode = actionUpper;

    if (actionUpper === 'VERIFY') {
      toState = 'VERIFIED';
      decisionCode = 'VERIFIED';
      parsedContext.verifierId = params.user.id;
      parsedContext.verifierName = params.user.name;
      parsedContext.verifierRole = params.user.role;
      parsedContext.verifiedAt = new Date().toISOString();
    } else if (actionUpper === 'APPROVE') {
      toState = 'APPROVED';
      decisionCode = 'APPROVED';
      parsedContext.approverId = params.user.id;
      parsedContext.approverName = params.user.name;
      parsedContext.approverRole = params.user.role;
      parsedContext.approvedAt = new Date().toISOString();
    } else if (actionUpper === 'REJECT') {
      toState = 'REJECTED';
      decisionCode = 'REJECTED';
    } else if (actionUpper === 'RETURN') {
      toState = 'RETURNED';
      decisionCode = 'RETURN_FOR_CORRECTION';
    } else if (actionUpper === 'DISBURSE') {
      toState = 'DISBURSED';
      decisionCode = 'DISBURSED';
    } else if (actionUpper === 'SETTLE') {
      toState = 'SETTLED';
      decisionCode = 'SETTLED';
    } else if (actionUpper === 'CLOSE') {
      toState = 'CLOSED';
      decisionCode = 'CLOSED';
    }

    const now = new Date().toISOString();

    // 3. Update Workflow Engine records if instance exists
    let updatedTask: any = null;
    if (instance) {
      // Find pending task
      const taskRows = await db
        .select()
        .from(phase66WorkflowTasks)
        .where(
          and(
            eq(phase66WorkflowTasks.instanceId, instance.id),
            eq(phase66WorkflowTasks.status, 'PENDING')
          )
        )
        .limit(1);

      if (taskRows.length > 0) {
        const task = taskRows[0];
        await db.execute(sql`
          UPDATE phase66_workflow_tasks
          SET status = ${decisionCode}, updated_at = ${now}
          WHERE id = ${task.id}
        `);
        updatedTask = task;
      }

      await db.execute(sql`
        UPDATE phase66_workflow_instances
        SET status = ${toState},
            data_context_json = ${JSON.stringify(parsedContext)},
            updated_at = ${now}
        WHERE id = ${instance.id}
      `);

      // Log to workflowHistory
      await db.insert(workflowHistory).values({
        id: `hist-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        workflowCode,
        entityType: params.entityType.toUpperCase(),
        entityId: params.entityId,
        fromState,
        toState,
        actionTaken: actionUpper,
        performedByUserId: actorId,
        performedByUserName: actorName,
        performedByUserRole: actorRole,
        department: params.user.department || parsedContext.department,
        comments: params.remarks || `${actionUpper} performed`,
        digitalSignature: params.digitalSignature || null,
        timestamp: now,
      });
    }

    // 4. Record Standardized Enterprise Audit Event
    const auditEvent = await enterpriseAuditRepository.logEvent({
      userId: params.user.id,
      userEmail: params.user.email,
      userRole: params.user.role,
      userName: params.user.name,
      actionType: actionUpper,
      entityType: params.entityType.toUpperCase(),
      entityId: params.entityId,
      entityNumber: params.entityNumber || parsedContext.entityNumber,
      fromState,
      toState,
      diffJson: {
        action: actionUpper,
        remarks: params.remarks,
        digitalSignature: params.digitalSignature,
        ...(params.additionalMetadata || {}),
      },
      metadata: {
        ...parsedContext,
        ...(params.additionalMetadata || {}),
      },
      reason: params.remarks || `Workflow transition ${fromState} -> ${toState}`,
      idempotencyKey: params.idempotencyKey,
      workflowInstanceId: instance?.id,
      workflowTaskId: updatedTask?.id,
    });

    return {
      success: true,
      workflowCode,
      fromState,
      toState,
      action: actionUpper,
      auditEvent,
    };
  }
}

export const universalWorkflowBindingService = UniversalWorkflowBindingService.getInstance();

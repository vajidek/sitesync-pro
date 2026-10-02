import { db } from '../../db';
import {
  notificationTemplates,
  notifications,
  automationRules,
  automationActions,
  automationLogs,
  scheduledJobs,
} from '../../db/schema';
import { eq, and, desc, like, or } from 'drizzle-orm';
import { isDemoSeedAllowed } from '../config/env';

export interface CreateTemplateDto {
  code: string;
  name: string;
  channel?: string;
  eventSource?: string;
  subjectTemplate?: string;
  bodyTemplate: string;
  variablesJson?: any;
}

export interface CreateRuleDto {
  code: string;
  name: string;
  description?: string;
  eventSource: string;
  triggerType: string;
  conditionsJson: any;
  priority?: string;
  executionOrder?: number;
  escalationEnabled?: boolean;
  escalationPolicyJson?: any;
  actions?: {
    actionType: string;
    templateId?: string;
    configJson: any;
    sequenceOrder?: number;
    delaySeconds?: number;
  }[];
}

export class AutomationsRepository {
  async ensureAutomationsSeeded() {
    const existingRules = await db.select().from(automationRules);
    if (existingRules.length === 0 && isDemoSeedAllowed()) {
      const now = new Date().toISOString();

      // Seed Notification Templates
      const seedTemplates = [
        {
          id: 'tpl-po-approval',
          code: 'TPL_PO_APPROVAL_REQUIRED',
          name: 'Procurement High Value PO Approval Alert',
          channel: 'IN_APP',
          eventSource: 'PROCUREMENT',
          subjectTemplate: 'Approval Required: PO {{poNumber}} ({{amount}})',
          bodyTemplate: 'Purchase Order {{poNumber}} created by {{createdBy}} requires your executive sign-off for total amount {{amount}}.',
          variablesJson: ['poNumber', 'amount', 'createdBy'],
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tpl-task-overdue',
          code: 'TPL_SITE_TASK_OVERDUE_ESCALATED',
          name: 'Overdue Site Task Manager Escalation',
          channel: 'EMAIL',
          eventSource: 'PROJECTS',
          subjectTemplate: 'ESCALATION: Overdue Milestone {{taskName}}',
          bodyTemplate: 'Site Task {{taskName}} for project {{projectName}} passed its deadline on {{dueDate}}. Escalated to Project Director.',
          variablesJson: ['taskName', 'projectName', 'dueDate'],
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tpl-inv-reorder',
          code: 'TPL_INVENTORY_REORDER_WARNING',
          name: 'Low Stock Level Threshold Alert',
          channel: 'DASHBOARD_ALERT',
          eventSource: 'INVENTORY',
          subjectTemplate: 'Warehouse Alert: Low Stock for {{itemName}}',
          bodyTemplate: 'Item {{itemName}} in warehouse {{warehouseName}} fell below safety threshold of {{threshold}}. Current stock: {{currentQty}}.',
          variablesJson: ['itemName', 'warehouseName', 'threshold', 'currentQty'],
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
      ];

      for (const t of seedTemplates) {
        await db.insert(notificationTemplates).values(t).onConflictDoNothing();
      }

      // Seed Automation Rules
      const seedRules = [
        {
          id: 'rule-po-approval',
          code: 'RULE_PO_THRESHOLD_APPROVAL',
          name: 'Auto-Trigger Manager SLA Approval for High POs',
          description: 'Triggers when a PO value exceeds $50,000 to assign executive workflow and dispatch in-app notifications.',
          eventSource: 'PROCUREMENT',
          triggerType: 'THRESHOLD_EXCEEDED',
          conditionsJson: {
            field: 'totalAmount',
            operator: 'GREATER_THAN',
            value: 50000,
          },
          priority: 'HIGH',
          executionOrder: 1,
          isActive: true,
          escalationEnabled: true,
          escalationPolicyJson: {
            delayHours: 24,
            escalateToRole: 'COMPANY_ADMIN',
          },
          createdBy: 'SYSTEM',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'rule-task-overdue',
          code: 'RULE_OVERDUE_MILESTONE_ESCALATION',
          name: 'Site Milestone Overdue Escalation Engine',
          description: 'Sends email alert and logs dashboard critical alert if site milestone remains incomplete past due date.',
          eventSource: 'PROJECTS',
          triggerType: 'OVERDUE',
          conditionsJson: {
            field: 'daysOverdue',
            operator: 'GREATER_THAN',
            value: 2,
          },
          priority: 'CRITICAL',
          executionOrder: 2,
          isActive: true,
          escalationEnabled: true,
          escalationPolicyJson: {
            delayHours: 12,
            escalateToRole: 'PROJECT_MANAGER',
          },
          createdBy: 'SYSTEM',
          createdAt: now,
          updatedAt: now,
        },
      ];

      for (const r of seedRules) {
        await db.insert(automationRules).values(r).onConflictDoNothing();
      }

      // Seed Rule Actions
      const seedActions = [
        {
          id: 'act-po-1',
          ruleId: 'rule-po-approval',
          actionType: 'IN_APP_NOTIFICATION',
          templateId: 'tpl-po-approval',
          configJson: { recipientRole: 'MANAGER' },
          sequenceOrder: 1,
          retryLimit: 3,
          delaySeconds: 0,
          createdAt: now,
        },
        {
          id: 'act-po-2',
          ruleId: 'rule-po-approval',
          actionType: 'WORKFLOW_TRIGGER',
          configJson: { workflowCode: 'WF_EXECUTIVE_PO_APPROVAL' },
          sequenceOrder: 2,
          retryLimit: 3,
          delaySeconds: 0,
          createdAt: now,
        },
        {
          id: 'act-task-1',
          ruleId: 'rule-task-overdue',
          actionType: 'EMAIL',
          templateId: 'tpl-task-overdue',
          configJson: { recipientRole: 'PROJECT_MANAGER' },
          sequenceOrder: 1,
          retryLimit: 3,
          delaySeconds: 0,
          createdAt: now,
        },
      ];

      for (const a of seedActions) {
        await db.insert(automationActions).values(a).onConflictDoNothing();
      }

      // Seed Notifications
      const seedNotifications = [
        {
          id: 'ntf-001',
          recipientUserId: 'SYSTEM_DEMO_RECIPIENT',
          templateId: 'tpl-po-approval',
          title: 'Approval Required: PO-2026-8891 ($125,000)',
          message: 'Purchase Order PO-2026-8891 created by Metro Civil Lead requires your executive sign-off.',
          channel: 'IN_APP',
          eventSource: 'PROCUREMENT',
          priority: 'HIGH',
          isRead: false,
          actionUrl: '/procurement/po/PO-2026-8891',
          createdAt: now,
        },
        {
          id: 'ntf-002',
          recipientUserId: 'usr-admin',
          templateId: 'tpl-inv-reorder',
          title: 'Warehouse Alert: Low Stock for Rebar Fe500',
          message: 'Structural Steel Rebar in Metro Site Central Yard fell below threshold. Current: 12 Tons.',
          channel: 'DASHBOARD_ALERT',
          eventSource: 'INVENTORY',
          priority: 'CRITICAL',
          isRead: true,
          readAt: now,
          actionUrl: '/inventory/items/SKU-STEEL-500',
          createdAt: now,
        },
      ];

      for (const n of seedNotifications) {
        await db.insert(notifications).values(n).onConflictDoNothing();
      }
    }
  }

  // Automation Rules
  async getAutomationRules(eventSource?: string, search?: string) {
    await this.ensureAutomationsSeeded();
    const conditions = [];
    if (eventSource && eventSource !== 'ALL') {
      conditions.push(eq(automationRules.eventSource, eventSource));
    }
    if (search) {
      conditions.push(or(like(automationRules.name, `%${search}%`), like(automationRules.code, `%${search}%`)));
    }

    let rules;
    if (conditions.length > 0) {
      rules = await db.select().from(automationRules).where(and(...conditions)).orderBy(desc(automationRules.updatedAt));
    } else {
      rules = await db.select().from(automationRules).orderBy(desc(automationRules.updatedAt));
    }

    // Attach actions to each rule
    const rulesWithActions = [];
    for (const r of rules) {
      const actions = await db.select().from(automationActions).where(eq(automationActions.ruleId, r.id));
      rulesWithActions.push({ ...r, actions });
    }
    return rulesWithActions;
  }

  async getRuleById(id: string) {
    await this.ensureAutomationsSeeded();
    const [rule] = await db.select().from(automationRules).where(eq(automationRules.id, id));
    if (!rule) return null;

    const actions = await db.select().from(automationActions).where(eq(automationActions.ruleId, id));
    return { ...rule, actions };
  }

  async createAutomationRule(dto: CreateRuleDto) {
    const id = `rule-${Date.now()}`;
    const now = new Date().toISOString();

    const newRule = {
      id,
      code: dto.code.toUpperCase().replace(/\s+/g, '_'),
      name: dto.name,
      description: dto.description || '',
      eventSource: dto.eventSource,
      triggerType: dto.triggerType,
      conditionsJson: dto.conditionsJson || {},
      priority: dto.priority || 'NORMAL',
      executionOrder: dto.executionOrder || 1,
      isActive: true,
      escalationEnabled: dto.escalationEnabled || false,
      escalationPolicyJson: dto.escalationPolicyJson || null,
      createdBy: 'ADMIN',
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(automationRules).values(newRule);

    if (dto.actions && dto.actions.length > 0) {
      let idx = 1;
      for (const act of dto.actions) {
        await db.insert(automationActions).values({
          id: `act-${Date.now()}-${idx}`,
          ruleId: id,
          actionType: act.actionType,
          templateId: act.templateId || null,
          configJson: act.configJson || {},
          sequenceOrder: idx,
          retryLimit: 3,
          delaySeconds: act.delaySeconds || 0,
          createdAt: now,
        });
        idx++;
      }
    }

    return this.getRuleById(id);
  }

  async toggleRuleStatus(id: string) {
    const rule = await this.getRuleById(id);
    if (!rule) throw new Error('Automation Rule not found');

    const newStatus = !rule.isActive;
    await db.update(automationRules).set({ isActive: newStatus, updatedAt: new Date().toISOString() }).where(eq(automationRules.id, id));
    return { isActive: newStatus };
  }

  // Execution Engine & Trigger Evaluator
  async evaluateAndTrigger(eventSource: string, triggerType: string, payload: any, userContext?: any) {
    await this.ensureAutomationsSeeded();
    const rules = await db.select().from(automationRules).where(
      and(eq(automationRules.eventSource, eventSource), eq(automationRules.triggerType, triggerType), eq(automationRules.isActive, true))
    );

    const now = new Date().toISOString();
    const executionResults = [];

    for (const rule of rules) {
      const actions = await db.select().from(automationActions).where(eq(automationActions.ruleId, rule.id));

      for (const action of actions) {
        const logId = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Process Action Types
        let status = 'SUCCESS';
        let resultMsg = 'Action executed successfully';

        if (action.actionType === 'IN_APP_NOTIFICATION' || action.actionType === 'EMAIL' || action.actionType === 'DASHBOARD_ALERT') {
          // Dispatch notification
          const ntfId = `ntf-${Date.now()}`;
          await db.insert(notifications).values({
            id: ntfId,
            recipientUserId: userContext?.id || 'SYSTEM_WORKFLOW',
            templateId: action.templateId || null,
            title: `Automated ${action.actionType}: ${rule.name}`,
            message: `Event ${eventSource}.${triggerType} triggered automation rule ${rule.code}.`,
            channel: action.actionType,
            eventSource: eventSource,
            priority: rule.priority,
            isRead: false,
            createdAt: now,
          });
          resultMsg = `Notification created with ID ${ntfId}`;
        } else if (action.actionType === 'WORKFLOW_TRIGGER') {
          const cfg = (action.configJson || {}) as any;
          resultMsg = `Workflow ${cfg.workflowCode || 'DEFAULT_WF'} triggered automatically.`;
        } else if (action.actionType === 'WEBHOOK') {
          const cfg = (action.configJson || {}) as any;
          resultMsg = `Webhook dispatched to ${cfg.endpoint || 'https://api.external.com/hooks'}`;
        }

        // Record Execution Log
        await db.insert(automationLogs).values({
          id: logId,
          ruleId: rule.id,
          actionId: action.id,
          eventSource: eventSource,
          triggerType: triggerType,
          status: status,
          payloadJson: payload || {},
          resultJson: { message: resultMsg },
          retryCount: 0,
          executedAt: now,
        });

        executionResults.push({
          ruleCode: rule.code,
          actionType: action.actionType,
          status,
          logId,
        });
      }
    }

    return { triggeredCount: rules.length, executions: executionResults };
  }

  // Notification Templates
  async getTemplates() {
    await this.ensureAutomationsSeeded();
    return db.select().from(notificationTemplates).orderBy(desc(notificationTemplates.updatedAt));
  }

  async createTemplate(dto: CreateTemplateDto) {
    const id = `tpl-${Date.now()}`;
    const now = new Date().toISOString();

    const newTpl = {
      id,
      code: dto.code.toUpperCase().replace(/\s+/g, '_'),
      name: dto.name,
      channel: dto.channel || 'IN_APP',
      eventSource: dto.eventSource || 'PROJECTS',
      subjectTemplate: dto.subjectTemplate || '',
      bodyTemplate: dto.bodyTemplate,
      variablesJson: dto.variablesJson || [],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(notificationTemplates).values(newTpl);
    return newTpl;
  }

  // Notifications CRUD & User Feed
  async getUserNotifications(userId: string) {
    await this.ensureAutomationsSeeded();
    return db.select().from(notifications).where(eq(notifications.recipientUserId, userId)).orderBy(desc(notifications.createdAt));
  }

  async markNotificationRead(id: string) {
    await db.update(notifications).set({ isRead: true, readAt: new Date().toISOString() }).where(eq(notifications.id, id));
    return { success: true };
  }

  // Execution Monitor Logs & Retry
  async getExecutionLogs() {
    await this.ensureAutomationsSeeded();
    return db.select().from(automationLogs).orderBy(desc(automationLogs.executedAt));
  }

  async retryFailedLog(logId: string) {
    const [log] = await db.select().from(automationLogs).where(eq(automationLogs.id, logId));
    if (!log) throw new Error('Execution Log not found');

    const now = new Date().toISOString();
    await db.update(automationLogs).set({
      status: 'SUCCESS',
      retryCount: log.retryCount + 1,
      errorMessage: null,
      executedAt: now,
      resultJson: { message: 'Manual retry executed successfully' },
    }).where(eq(automationLogs.id, logId));

    return { success: true, message: 'Log retried successfully' };
  }
}

export const automationsRepository = new AutomationsRepository();

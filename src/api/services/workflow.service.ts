import { WorkflowRepository } from '../repositories/workflow.repository';

export class WorkflowService {
  private repo: WorkflowRepository;

  constructor() {
    this.repo = new WorkflowRepository();
  }

  public async getWorkflowStats(user?: any) {
    return this.repo.getWorkflowStats();
  }

  public async getWorkflows(module?: string, status?: string) {
    return this.repo.getWorkflows(module, status);
  }

  public async getWorkflowById(id: string) {
    return this.repo.getWorkflowById(id);
  }

  public async createWorkflow(data: any, createdBy?: string) {
    return this.repo.createWorkflow(data, createdBy);
  }

  public async updateWorkflow(id: string, data: any, updatedBy?: string) {
    return this.repo.updateWorkflow(id, data, updatedBy);
  }

  public async duplicateWorkflow(wfId: string, createdBy?: string) {
    return this.repo.duplicateWorkflow(wfId, createdBy);
  }

  public async publishWorkflow(id: string, publishedBy?: string) {
    return this.repo.publishWorkflow(id, publishedBy);
  }

  // States & Transitions
  public async getStatesByWorkflowId(workflowId: string, versionNumber?: number) {
    return this.repo.getStatesByWorkflowId(workflowId, versionNumber);
  }

  public async createState(data: any) {
    return this.repo.createState(data);
  }

  public async deleteState(id: string) {
    return this.repo.deleteState(id);
  }

  public async getTransitionsByWorkflowId(workflowId: string, versionNumber?: number) {
    return this.repo.getTransitionsByWorkflowId(workflowId, versionNumber);
  }

  public async createTransition(data: any) {
    return this.repo.createTransition(data);
  }

  public async deleteTransition(id: string) {
    return this.repo.deleteTransition(id);
  }

  // Instances & Submissions
  public async submitWorkflowInstance(data: any, requester?: any) {
    const result = await this.repo.submitWorkflowInstance(data, requester);
    
    // Auto generate notification for assigned approver
    await this.repo.createNotification({
      title: `Approval Required: ${data.entityType} ${data.title}`,
      message: `A new ${data.entityType} request '${data.title}' prioritised as ${data.priority} has been submitted for approval. Converted Amount: ${data.currency || 'AED'} ${data.amount || 0}`,
      category: 'APPROVAL',
      severity: data.priority === 'URGENT' ? 'CRITICAL' : 'WARNING',
      linkUrl: '/workflow',
    });

    return result;
  }

  public async getPendingTasks(user?: any, filters?: any) {
    return this.repo.getPendingTasks(user, filters);
  }

  public async processApprovalDecision(data: any, user?: any) {
    const result = await this.repo.processApprovalDecision(data, user);
    const approverName = user?.name || user?.email || 'Authorized Approver';

    // Dynamic notification routing based on decision
    if (data.decision === 'RETURN_FOR_CORRECTION' || data.decision === 'REVISION_REQUESTED') {
      await this.repo.createNotification({
        title: `Revision Requested for Task ${data.taskId}`,
        message: `${approverName} returned the request for revision: ${data.comments || 'Please address feedback and resubmit.'}`,
        category: 'TASK',
        severity: 'WARNING',
        linkUrl: '/workflow',
      });
    } else if (data.decision === 'APPROVED') {
      await this.repo.createNotification({
        title: `Task Approved: ${data.taskId}`,
        message: `Your request was officially approved and certified by ${approverName}.`,
        category: 'APPROVAL',
        severity: 'SUCCESS',
        linkUrl: '/workflow',
      });
    } else if (data.decision === 'REJECTED') {
      await this.repo.createNotification({
        title: `Task Rejected: ${data.taskId}`,
        message: `Your request was rejected by ${approverName}. Remarks: ${data.comments || 'Does not meet criteria.'}`,
        category: 'ALERT',
        severity: 'CRITICAL',
        linkUrl: '/workflow',
      });
    }

    return result;
  }

  // Delegations
  public async getDelegations(user?: any) {
    return this.repo.getDelegations(user);
  }

  public async createDelegation(data: any, delegator?: any) {
    return this.repo.createDelegation(data, delegator);
  }

  // Escalations & History
  public async getEscalations() {
    return this.repo.getEscalations();
  }

  public async getWorkflowHistory(entityId?: string) {
    return this.repo.getWorkflowHistory(entityId);
  }

  // Notifications & Announcements
  public async getNotifications() {
    return this.repo.getNotifications();
  }

  public async createNotification(data: any) {
    return this.repo.createNotification(data);
  }

  public async getAnnouncements() {
    return this.repo.getAnnouncements();
  }

  public async createAnnouncement(data: any) {
    const anc = await this.repo.createAnnouncement(data);

    await this.repo.createNotification({
      title: `Announcement: ${data.title}`,
      message: data.content,
      category: 'ANNOUNCEMENT',
      severity: data.priority === 'URGENT' ? 'CRITICAL' : 'INFO',
      linkUrl: '/workflow',
    });

    return anc;
  }

  public async getActivityFeed() {
    return this.repo.getActivityFeed();
  }
}

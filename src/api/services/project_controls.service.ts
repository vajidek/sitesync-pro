import { ProjectControlsRepository } from '../repositories/project_controls.repository';

export class ProjectControlsService {
  private repo: ProjectControlsRepository;

  constructor() {
    this.repo = new ProjectControlsRepository();
  }

  public async getStats(projectId?: string) {
    return this.repo.getStats(projectId);
  }

  public async getCostControlMatrix(projectId?: string) {
    return this.repo.getCostControlMatrix(projectId);
  }

  // WBS
  public async getWbsList(projectId?: string) {
    return this.repo.getWbsList(projectId);
  }

  public async createWbs(data: any) {
    return this.repo.createWbs(data);
  }

  // Work Packages
  public async getWorkPackages(wbsId?: string, projectId?: string) {
    return this.repo.getWorkPackages(wbsId, projectId);
  }

  public async createWorkPackage(data: any) {
    return this.repo.createWorkPackage(data);
  }

  // Activities & CPM
  public async getActivities(projectId?: string) {
    const activities = await this.repo.getActivities(projectId);
    const relationships = await this.repo.getRelationships(projectId);

    // Dynamic CPM computation for Float and Critical Path
    return this.calculateCPM(activities, relationships);
  }

  public async createActivity(data: any) {
    return this.repo.createActivity(data);
  }

  // Relationships
  public async getRelationships(projectId?: string) {
    return this.repo.getRelationships(projectId);
  }

  public async createRelationship(data: any) {
    return this.repo.createRelationship(data);
  }

  // Baselines & Calendars
  public async getBaselines(projectId?: string) {
    return this.repo.getBaselines(projectId);
  }

  public async createBaseline(data: any) {
    return this.repo.createBaseline(data);
  }

  public async getCalendars(projectId?: string) {
    return this.repo.getCalendars(projectId);
  }

  public async createCalendar(data: any) {
    return this.repo.createCalendar(data);
  }

  // Resources & Assignments
  public async getResources() {
    return this.repo.getResources();
  }

  public async createResource(data: any) {
    return this.repo.createResource(data);
  }

  public async getResourceAssignments(activityId?: string) {
    return this.repo.getResourceAssignments(activityId);
  }

  public async assignResource(data: any) {
    return this.repo.assignResource(data);
  }

  // Progress (EVM Core)
  public async getProgress(projectId?: string) {
    return this.repo.getProgress(projectId);
  }

  public async addProgressSnapshot(data: any) {
    return this.repo.addProgressSnapshot(data);
  }

  // Delays
  public async getDelays(projectId?: string) {
    return this.repo.getDelays(projectId);
  }

  public async createDelay(data: any) {
    return this.repo.createDelay(data);
  }

  // Milestones
  public async getMilestones(projectId?: string) {
    return this.repo.getMilestones(projectId);
  }

  public async createMilestone(data: any) {
    return this.repo.createMilestone(data);
  }

  // Risks & Issues
  public async getRisks(projectId?: string) {
    return this.repo.getRisks(projectId);
  }

  public async createRisk(data: any) {
    return this.repo.createRisk(data);
  }

  public async getIssues(projectId?: string) {
    return this.repo.getIssues(projectId);
  }

  public async createIssue(data: any) {
    return this.repo.createIssue(data);
  }

  // Change Requests
  public async getChangeRequests(projectId?: string) {
    return this.repo.getChangeRequests(projectId);
  }

  public async createChangeRequest(data: any) {
    return this.repo.createChangeRequest(data);
  }

  // Lookahead Plans
  public async getLookaheadPlans(projectId?: string) {
    return this.repo.getLookaheadPlans(projectId);
  }

  public async createLookaheadPlan(data: any) {
    return this.repo.createLookaheadPlan(data);
  }

  // Daily, Weekly, Monthly Progress
  public async getDailyProgress(projectId?: string) {
    return this.repo.getDailyProgress(projectId);
  }

  public async createDailyProgress(data: any) {
    return this.repo.createDailyProgress(data);
  }

  public async getWeeklyProgress(projectId?: string) {
    return this.repo.getWeeklyProgress(projectId);
  }

  public async getMonthlyProgress(projectId?: string) {
    return this.repo.getMonthlyProgress(projectId);
  }

  // CPM Calculation Algorithm Helper
  private calculateCPM(activities: any[], relationships: any[]) {
    if (!activities || activities.length === 0) return [];

    const activityMap = new Map<string, any>();
    activities.forEach((act) => {
      activityMap.set(act.id, {
        ...act,
        successors: [],
        predecessors: [],
        earlyStartDays: 0,
        earlyFinishDays: act.durationDays || 1,
        lateStartDays: 0,
        lateFinishDays: 0,
        calculatedTotalFloat: 0,
        calculatedIsCritical: false,
      });
    });

    relationships.forEach((rel) => {
      const pred = activityMap.get(rel.predecessorActivityId);
      const succ = activityMap.get(rel.successorActivityId);
      if (pred && succ) {
        pred.successors.push({ id: succ.id, type: rel.relationshipType, lag: rel.lagDays || 0 });
        succ.predecessors.push({ id: pred.id, type: rel.relationshipType, lag: rel.lagDays || 0 });
      }
    });

    // Forward Pass
    let maxProjectDuration = 0;
    activityMap.forEach((act) => {
      if (act.predecessors.length === 0) {
        act.earlyStartDays = 0;
        act.earlyFinishDays = act.durationDays;
      } else {
        let maxEarlyStart = 0;
        act.predecessors.forEach((p: any) => {
          const predAct = activityMap.get(p.id);
          if (predAct) {
            const predFinish = predAct.earlyFinishDays + p.lag;
            if (predFinish > maxEarlyStart) maxEarlyStart = predFinish;
          }
        });
        act.earlyStartDays = maxEarlyStart;
        act.earlyFinishDays = act.earlyStartDays + act.durationDays;
      }
      if (act.earlyFinishDays > maxProjectDuration) {
        maxProjectDuration = act.earlyFinishDays;
      }
    });

    // Backward Pass
    activityMap.forEach((act) => {
      act.lateFinishDays = maxProjectDuration;
      act.lateStartDays = maxProjectDuration - act.durationDays;
    });

    const reverseMapArray = Array.from(activityMap.values()).reverse();
    reverseMapArray.forEach((act) => {
      if (act.successors.length > 0) {
        let minLateFinish = maxProjectDuration;
        act.successors.forEach((s: any) => {
          const succAct = activityMap.get(s.id);
          if (succAct) {
            const succLateStart = succAct.lateStartDays - s.lag;
            if (succLateStart < minLateFinish) minLateFinish = succLateStart;
          }
        });
        act.lateFinishDays = minLateFinish;
        act.lateStartDays = act.lateFinishDays - act.durationDays;
      }
      act.calculatedTotalFloat = Math.max(0, act.lateStartDays - act.earlyStartDays);
      act.calculatedIsCritical = act.calculatedTotalFloat === 0 || act.isCritical === true;
    });

    return Array.from(activityMap.values()).map((act) => ({
      ...act,
      totalFloat: act.calculatedTotalFloat,
      isCritical: act.calculatedIsCritical,
    }));
  }
}

import { Request, Response } from 'express';
import { resourceService } from '../services/resource.service';

export class ResourceController {
  // Types & Groups
  async getTypes(req: Request, res: Response) {
    try {
      const types = await resourceService.getTypes();
      res.json({ success: true, data: types });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createType(req: Request, res: Response) {
    try {
      const type = await resourceService.createType(req.body, (req as any).user);
      res.status(201).json({ success: true, data: type });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getGroups(req: Request, res: Response) {
    try {
      const groups = await resourceService.getGroups();
      res.json({ success: true, data: groups });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createGroup(req: Request, res: Response) {
    try {
      const group = await resourceService.createGroup(req.body, (req as any).user);
      res.status(201).json({ success: true, data: group });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Skills
  async getSkills(req: Request, res: Response) {
    try {
      const skills = await resourceService.getSkills();
      res.json({ success: true, data: skills });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createSkill(req: Request, res: Response) {
    try {
      const skill = await resourceService.createSkill(req.body, (req as any).user);
      res.status(201).json({ success: true, data: skill });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Plans
  async getPlans(req: Request, res: Response) {
    try {
      const filters = {
        projectId: req.query.projectId as string,
        departmentId: req.query.departmentId as string,
        status: req.query.status as string,
        search: req.query.search as string,
      };
      const plans = await resourceService.getPlans(filters);
      res.json({ success: true, data: plans });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getPlanById(req: Request, res: Response) {
    try {
      const plan = await resourceService.getPlanById(req.params.id);
      res.json({ success: true, data: plan });
    } catch (error: any) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async createPlan(req: Request, res: Response) {
    try {
      const plan = await resourceService.createPlan(req.body, (req as any).user);
      res.status(201).json({ success: true, data: plan });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async updatePlan(req: Request, res: Response) {
    try {
      const plan = await resourceService.updatePlan(req.params.id, req.body, (req as any).user);
      res.json({ success: true, data: plan });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async deletePlan(req: Request, res: Response) {
    try {
      const result = await resourceService.deletePlan(req.params.id, (req as any).user);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async restorePlan(req: Request, res: Response) {
    try {
      const restored = await resourceService.restorePlan(req.params.id, (req as any).user);
      res.json({ success: true, data: restored });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async clonePlan(req: Request, res: Response) {
    try {
      const cloned = await resourceService.clonePlan(req.params.id, (req as any).user);
      res.status(201).json({ success: true, data: cloned });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Allocations
  async getAllocations(req: Request, res: Response) {
    try {
      const filters = {
        projectId: req.query.projectId as string,
        departmentId: req.query.departmentId as string,
        resourceId: req.query.resourceId as string,
        status: req.query.status as string,
      };
      const allocs = await resourceService.getAllocations(filters);
      res.json({ success: true, data: allocs });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getAllocationById(req: Request, res: Response) {
    try {
      const alloc = await resourceService.getAllocationById(req.params.id);
      res.json({ success: true, data: alloc });
    } catch (error: any) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async createAllocation(req: Request, res: Response) {
    try {
      const alloc = await resourceService.allocateResource(req.body, (req as any).user);
      res.status(201).json({ success: true, data: alloc });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async updateAllocation(req: Request, res: Response) {
    try {
      const alloc = await resourceService.updateAllocation(req.params.id, req.body, (req as any).user);
      res.json({ success: true, data: alloc });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async releaseAllocation(req: Request, res: Response) {
    try {
      const alloc = await resourceService.releaseResource(req.params.id, (req as any).user, req.body?.remarks);
      res.json({ success: true, data: alloc });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async transferAllocation(req: Request, res: Response) {
    try {
      const alloc = await resourceService.transferResource(req.params.id, req.body?.newProjectId, (req as any).user, req.body?.remarks);
      res.json({ success: true, data: alloc });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async deleteAllocation(req: Request, res: Response) {
    try {
      const result = await resourceService.deleteAllocation(req.params.id, (req as any).user);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Availability & Utilization
  async getAvailability(req: Request, res: Response) {
    try {
      const resourceId = req.query.resourceId as string;
      const date = req.query.date as string;
      const data = await resourceService.getAvailability(resourceId, date);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async calculateAvailability(req: Request, res: Response) {
    try {
      const { resourceId, date, totalCapacity, allocatedCapacity } = req.body;
      const data = await resourceService.calculateAvailability(resourceId, date, totalCapacity, allocatedCapacity);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getUtilization(req: Request, res: Response) {
    try {
      const projectId = req.query.projectId as string;
      const date = req.query.date as string;
      const data = await resourceService.getUtilization(projectId, date);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Requests
  async getRequests(req: Request, res: Response) {
    try {
      const filters = {
        projectId: req.query.projectId as string,
        status: req.query.status as string,
      };
      const data = await resourceService.getRequests(filters);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getRequestById(req: Request, res: Response) {
    try {
      const reqData = await resourceService.getRequestById(req.params.id);
      res.json({ success: true, data: reqData });
    } catch (error: any) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async createRequest(req: Request, res: Response) {
    try {
      const created = await resourceService.createRequest(req.body, (req as any).user);
      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async approveRequest(req: Request, res: Response) {
    try {
      const updated = await resourceService.processApproval(req.params.id, 'APPROVE', (req as any).user, req.body?.remarks);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async rejectRequest(req: Request, res: Response) {
    try {
      const updated = await resourceService.processApproval(req.params.id, 'REJECT', (req as any).user, req.body?.remarks);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Calendars
  async getCalendars(req: Request, res: Response) {
    try {
      const data = await resourceService.getCalendars(req.query);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createCalendarEntry(req: Request, res: Response) {
    try {
      const created = await resourceService.createCalendarEntry(req.body, (req as any).user);
      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getShiftTemplates(req: Request, res: Response) {
    try {
      const data = await resourceService.getShiftTemplates();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getHolidays(req: Request, res: Response) {
    try {
      const data = await resourceService.getHolidays();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Costs
  async getCosts(req: Request, res: Response) {
    try {
      const data = await resourceService.getCosts();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createCost(req: Request, res: Response) {
    try {
      const created = await resourceService.createCost(req.body, (req as any).user);
      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Conflicts
  async getConflicts(req: Request, res: Response) {
    try {
      const status = req.query.status as string;
      const data = await resourceService.getConflicts(status);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async resolveConflict(req: Request, res: Response) {
    try {
      const resolved = await resourceService.resolveConflict(req.params.id, (req as any).user, req.body?.notes);
      res.json({ success: true, data: resolved });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Dashboard KPIs
  async getDashboardKpis(req: Request, res: Response) {
    try {
      const kpis = await resourceService.getDashboardKpis();
      res.json({ success: true, data: kpis });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Logs
  async getLogs(req: Request, res: Response) {
    try {
      const logs = await resourceService.getLogs();
      res.json({ success: true, data: logs });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export const resourceController = new ResourceController();

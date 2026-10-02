import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { abacService } from '../services/abac.service';

export class AbacController {
  async getPolicies(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const policies = await abacService.getPolicies();
      res.json({ success: true, data: policies });
    } catch (err) {
      next(err);
    }
  }

  async getPolicyById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const policy = await abacService.getPolicyById(id);
      if (!policy) {
        return res.status(404).json({ success: false, message: 'Policy not found' });
      }
      res.json({ success: true, data: policy });
    } catch (err) {
      next(err);
    }
  }

  async createPolicy(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const created = await abacService.createPolicy(req.body);
      res.status(201).json({ success: true, data: created, message: 'Permission Policy created successfully' });
    } catch (err) {
      next(err);
    }
  }

  async updatePolicy(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await abacService.updatePolicy(id, req.body);
      res.json({ success: true, data: updated, message: 'Permission Policy updated' });
    } catch (err) {
      next(err);
    }
  }

  async getPolicyAttributes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { policyId } = req.params;
      const attrs = await abacService.getPolicyAttributes(policyId);
      res.json({ success: true, data: attrs });
    } catch (err) {
      next(err);
    }
  }

  async createAttribute(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const attr = await abacService.createAttribute(req.body);
      res.status(201).json({ success: true, data: attr, message: 'Policy Attribute condition created' });
    } catch (err) {
      next(err);
    }
  }

  async getPolicyScopes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { policyId } = req.params;
      const scopes = await abacService.getPolicyScopes(policyId);
      res.json({ success: true, data: scopes });
    } catch (err) {
      next(err);
    }
  }

  async createScope(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const scope = await abacService.createScope(req.body);
      res.status(201).json({ success: true, data: scope, message: 'Policy Scope created' });
    } catch (err) {
      next(err);
    }
  }

  async getFieldPermissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { moduleCode } = req.query;
      const fields = await abacService.getFieldPermissions(moduleCode ? String(moduleCode) : undefined);
      res.json({ success: true, data: fields });
    } catch (err) {
      next(err);
    }
  }

  async createFieldPermission(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const fp = await abacService.createFieldPermission(req.body);
      res.status(201).json({ success: true, data: fp, message: 'Field level security rule created' });
    } catch (err) {
      next(err);
    }
  }

  async getFeaturePermissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { moduleCode } = req.query;
      const feats = await abacService.getFeaturePermissions(moduleCode ? String(moduleCode) : undefined);
      res.json({ success: true, data: feats });
    } catch (err) {
      next(err);
    }
  }

  async createFeaturePermission(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const fp = await abacService.createFeaturePermission(req.body);
      res.status(201).json({ success: true, data: fp, message: 'Feature level visibility rule created' });
    } catch (err) {
      next(err);
    }
  }

  async evaluateEffectivePermissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const context = {
        userId: user?.id || 'usr-anon',
        role: user?.role || 'USER',
        departmentId: user?.department,
        moduleCode: String(req.query.moduleCode || 'PROJECTS'),
        featureCode: String(req.query.featureCode || '*'),
        projectId: req.query.projectId ? String(req.query.projectId) : undefined,
      };
      const result = await abacService.evaluateEffectivePermissions(context);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async simulatePermissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const simulation = await abacService.simulatePermissions(req.body);
      res.json({ success: true, data: simulation, message: 'ABAC Permission simulation executed' });
    } catch (err) {
      next(err);
    }
  }
}

export const abacController = new AbacController();

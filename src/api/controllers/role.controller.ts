import { Request, Response, NextFunction } from 'express';
import { roleRepository } from '../repositories/role.repository';
import { adminService } from '../services/admin.service';
import { AuthenticatedRequest } from '../types/auth';
import { sendSuccess, sendError } from '../utils/response';

export class RoleController {
  async getRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await roleRepository.findAll();
      const rolesWithPerms = await Promise.all(
        roles.map(async (r) => {
          const perms = await roleRepository.getRolePermissions(r.id);
          return {
            ...r,
            permissions: perms.map((p) => p.code),
            permissionDetails: perms,
          };
        })
      );
      return sendSuccess(res, rolesWithPerms, 'Roles and database permissions retrieved successfully.');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to retrieve roles', 500);
    }
  }

  async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      const actorEmail = (req as AuthenticatedRequest).user?.email;
      const role = await adminService.createRole(req.body, actorEmail);
      return res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: role,
      });
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to create role', 400);
    }
  }

  async getRolePermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const { roleId } = req.params;
      const perms = await roleRepository.getRolePermissions(roleId);
      return sendSuccess(res, perms, 'Permissions retrieved for specified role.');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to retrieve permissions', 500);
    }
  }

  async deleteRole(req: Request, res: Response, next: NextFunction) {
    try {
      const actorEmail = (req as AuthenticatedRequest).user?.email;
      await adminService.deleteRole(req.params.roleId, actorEmail);
      return sendSuccess(res, null, 'Role deleted successfully.');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to delete role', 400);
    }
  }
}

export const roleController = new RoleController();

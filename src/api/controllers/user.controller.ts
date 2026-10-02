import { Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types/auth';

export class UserController {
  async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers();
      return sendSuccess(res, users, 'User list retrieved successfully.');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to retrieve users', 500);
    }
  }

  async getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.getUserDetails(id);
      return sendSuccess(res, user, 'User details retrieved.');
    } catch (err: any) {
      return sendError(res, err.message || 'User not found', 404);
    }
  }

  async createUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const newUser = await userService.createUser(req.body, req.user?.email);
      return sendSuccess(res, newUser, 'User created successfully.', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to create user', 400);
    }
  }

  async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await userService.updateUser(id, req.body, req.user?.email);
      return sendSuccess(res, updated, 'User updated successfully.');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update user', 400);
    }
  }

  async deactivateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await userService.deactivateUser(id, req.user?.email);
      return sendSuccess(res, { id, deactivated: true }, 'User deactivated successfully.');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to deactivate user', 400);
    }
  }
}

export const userController = new UserController();

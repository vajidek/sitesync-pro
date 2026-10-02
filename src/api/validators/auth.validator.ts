import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const loginSchema = z.object({
  userId: z.string().min(1, 'User ID is required').optional(),
  username: z.string().min(1, 'User ID is required').optional(),
  email: z.string().min(1, 'User ID or Email is required').optional(),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR', 'STORE_KEEPER', 'DRIVER', 'OPERATOR', 'WORKER']).optional(),
  rememberMe: z.boolean().optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
});

export const forgotPasswordSchema = z.object({
  userId: z.string().optional(),
  email: z.string().optional(),
  identifier: z.string().optional(),
});

export const resetPasswordSchema = z.object({
  resetToken: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const formattedErrors = result.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return sendError(res, 'Validation error', 400, formattedErrors);
    }
    req.body = result.data;
    next();
  };
};

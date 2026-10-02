import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: PaginationMeta;
  errors?: any;
  meta?: Record<string, any>;
  timestamp: string;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200,
  pagination?: PaginationMeta,
  meta?: Record<string, any>
): Response => {
  const responseBody: ApiResponse<T> = {
    success: true,
    message: message || 'Operation completed successfully',
    data,
    pagination,
    meta,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(responseBody);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  errors?: any,
  meta?: Record<string, any>
): Response => {
  const responseBody: ApiResponse = {
    success: false,
    message,
    errors,
    meta,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(responseBody);
};


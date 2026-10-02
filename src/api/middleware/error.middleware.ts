import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { sendError } from '../utils/response';

export function notFoundHandler(req: Request, res: Response) {
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  return sendError(res, `Route API endpoint '${req.method} ${req.originalUrl}' not found on SiteSync Pro server.`, 404);
}

export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error encountered in SiteSync Pro backend.';

  logger.error(`[Global Error] Status ${statusCode} - ${message} on ${req.method} ${req.originalUrl}`, {
    stack: err.stack,
    body: req.body,
    ip: req.ip,
  });

  return sendError(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? err.errors || [err.stack] : undefined
  );
}

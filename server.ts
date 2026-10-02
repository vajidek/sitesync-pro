import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import { createServer as createViteServer } from 'vite';
import apiRouter from './src/api/routes/index';
import { apiLimiter } from './src/api/middleware/rateLimit.middleware';
import { globalErrorHandler, notFoundHandler } from './src/api/middleware/error.middleware';
import { logger } from './src/api/utils/logger';
import { ENV } from './src/api/config/env';

async function startServer() {
  const app = express();
  const PORT = ENV.PORT;

  // Production Security Verification: Fail safely or issue critical warning if fallback secrets are used
  if (ENV.NODE_ENV === 'production') {
    const isDefaultJwt = !process.env.JWT_SECRET || process.env.JWT_SECRET.includes('sitesync-pro-enterprise-jwt-access-secret-2026-key');
    const isDefaultRefresh = !process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.includes('sitesync-pro-enterprise-jwt-refresh-secret-2026-key');
    if (isDefaultJwt || isDefaultRefresh) {
      if (process.env.STRICT_PROD_SECRETS === 'true') {
        throw new Error('FATAL PRODUCTION SECURITY ERROR: Production deployment requires unique cryptographically secure JWT_SECRET and JWT_REFRESH_SECRET environment variables. Refusing to start with development fallback secrets.');
      } else {
        logger.warn('[SECURITY WARNING] Production running with default development fallback secrets. Set custom JWT_SECRET and JWT_REFRESH_SECRET in production environment.');
      }
    }
  }

  // Trust proxy for reverse proxy / Cloud Run container environment
  app.set('trust proxy', 1);

  // Security Middlewares
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disabled for internal dev preview scripts compatibility
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use(cors());

  // Body Parsing Middlewares
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // Request Logging Middleware (Filters internal Vite/dev assets to keep logs clean)
  app.use((req, res, next) => {
    const url = req.url;
    const isAsset =
      url.startsWith('/src/') ||
      url.startsWith('/@vite') ||
      url.startsWith('/@fs') ||
      url.startsWith('/node_modules') ||
      url.endsWith('.tsx') ||
      url.endsWith('.ts') ||
      url.endsWith('.css') ||
      url.endsWith('.js') ||
      url.endsWith('.map') ||
      url.includes('favicon.ico') ||
      url.includes('manifest.json');

    if (!isAsset) {
      logger.info(`[HTTP] ${req.method} ${url} - IP: ${req.ip}`);
    }
    next();
  });

  // Health check endpoints
  const healthHandler = (req: express.Request, res: express.Response) => {
    res.json({
      status: 'ok',
      app: ENV.APP_NAME,
      version: '1.0.0',
      subtitle: 'Construction & Infrastructure Project Management Platform',
      developer: ENV.DEVELOPER,
      timestamp: new Date().toISOString(),
      architecture: 'Enterprise Clean Architecture (Node.js + Express + TypeScript + Prisma + JWT + Zod + Winston + Helmet)',
    });
  };

  app.get('/api/health', healthHandler);
  app.get('/api/v1/health', healthHandler);

  // Authoritative server-resolved deployment environment endpoint
  app.get(['/api/environment', '/api/v1/environment'], (req, res) => {
    const deploymentEnv: 'DEMO' | 'UAT' | 'PRODUCTION' =
      process.env.APP_ENVIRONMENT === 'PRODUCTION'
        ? 'PRODUCTION'
        : process.env.APP_ENVIRONMENT === 'UAT'
        ? 'UAT'
        : process.env.APP_ENVIRONMENT === 'DEMO'
        ? 'DEMO'
        : process.env.NODE_ENV === 'production'
        ? 'PRODUCTION'
        : 'DEMO';

    res.json({
      success: true,
      data: {
        deploymentEnvironment: deploymentEnv,
        isProduction: deploymentEnv === 'PRODUCTION',
        isUat: deploymentEnv === 'UAT',
        isDemoDeployment: deploymentEnv === 'DEMO',
        // In UAT and PRODUCTION, client environment switching is strictly prohibited
        allowClientSwitching: deploymentEnv === 'DEMO',
        nodeEnv: process.env.NODE_ENV || 'development',
      },
    });
  });

  app.get('/api/info', (req, res) => {
    res.json({
      appName: ENV.APP_NAME,
      subtitle: 'Construction & Infrastructure Project Management Platform',
      developer: ENV.DEVELOPER,
      footer: 'Designed & Developed by Abdul Vajid EK',
      version: '2.0.0-enterprise',
      phase: 'Phase 40 Enterprise Backend Foundation',
      techStack: [
        'React 19',
        'TypeScript',
        'Tailwind CSS',
        'Node.js Express',
        'JWT & Refresh Tokens',
        'Bcrypt Hashing',
        'Zod Validation',
        'Winston Logging',
        'Helmet Security',
        'PostgreSQL & Prisma v6',
      ],
    });
  });

  // Apply API rate limiting and mount enterprise routes under /api/v1 and /api
  app.use('/api/v1', apiLimiter, apiRouter);
  app.use('/api', apiLimiter, apiRouter);

  // Global API 404 & Error Middlewares (MUST be before SPA fallback)
  app.use('/api', notFoundHandler);
  app.use(globalErrorHandler);

  // Serve Vite in development mode, or static files in production
  if (ENV.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`[SiteSync Pro Enterprise] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  logger.error('[SiteSync Pro Enterprise] Critical failure starting server:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('[SiteSync Pro Enterprise] Unhandled Rejection at:', { promise, reason });
});

process.on('uncaughtException', (err) => {
  logger.error('[SiteSync Pro Enterprise] Uncaught Exception thrown:', err);
});

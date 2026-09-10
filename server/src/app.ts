import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { userIdMiddleware } from './middleware/userId.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { securityHeaders } from './middleware/securityHeaders.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import catalogRoutes from './routes/catalog.js';
import profileRoutes from './routes/profile.js';
import recommendationRoutes from './routes/recommendations.js';
import pathRoutes from './routes/paths.js';
import feedbackRoutes from './routes/feedback.js';
import quizRoutes from './routes/quiz.js';
import chatRoutes from './routes/chat.js';
import { prisma } from './db.js';

function getCorsOrigin(): string | string[] | boolean {
  const raw = config.corsOrigin.trim();
  if (raw === '*' || raw === '') return true;
  if (raw.includes(',')) return raw.split(',').map((s) => s.trim()).filter(Boolean);
  return raw;
}

export function createApp() {
  const app = express();

  app.use(securityHeaders);
  app.use(requestIdMiddleware);

  const corsOrigin = getCorsOrigin();
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (corsOrigin === true) return cb(null, true);
        if (Array.isArray(corsOrigin)) {
          if (corsOrigin.includes(origin)) return cb(null, true);
          const isLocalhost = /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);
          if (isLocalhost) return cb(null, true);
          return cb(new Error(`CORS blocked for origin ${origin}`));
        }
        if (origin === corsOrigin) return cb(null, true);
        const isLocalhost = /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);
        if (isLocalhost) return cb(null, true);
        return cb(new Error(`CORS blocked for origin ${origin}`));
      },
      credentials: true,
      exposedHeaders: ['X-User-Id', 'X-Request-Id'],
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(userIdMiddleware);

  app.get('/api/health', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ success: true, data: { status: 'ok', db: 'up', model: config.geminiModel, env: config.nodeEnv } });
    } catch {
      res.status(503).json({ success: false, error: 'DB unavailable', data: { status: 'degraded', db: 'down', model: config.geminiModel } });
    }
  });

  app.use('/api/catalog', catalogRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/recommendations', recommendationRoutes);
  app.use('/api/paths', pathRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/quiz', quizRoutes);
  app.use('/api/chat', chatRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

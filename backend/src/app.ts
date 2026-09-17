import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import chatRoutes from './routes/chat.js';
import decisionRoutes from './routes/decision.js';
import healthRoutes from './routes/health.js';

export const createApp = () => {
  const app = express();

  // Middleware
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or local dev
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        callback(null, true); // Dev-friendly permissive
      }
    },
    credentials: true
  }));

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Routes (support both /api/* and direct routes for Vercel serverless functions)
  app.use('/api/chat', chatRoutes);
  app.use('/chat', chatRoutes);

  app.use('/api/decision', decisionRoutes);
  app.use('/decision', decisionRoutes);

  app.use('/api/health', healthRoutes);
  app.use('/health', healthRoutes);

  // Root health fallback
  app.get(['/api/ping', '/ping'], (req, res) => {
    res.status(200).json({ status: 'ok', name: 'DecisionMate AI API', timestamp: new Date().toISOString() });
  });

  // Serve compiled frontend if running as full-stack server
  const candidates = [
    path.resolve(process.cwd(), 'frontend', 'dist'),
    path.resolve(process.cwd(), '..', 'frontend', 'dist')
  ];
  const frontendDist = candidates.find(dir => fs.existsSync(dir));

  if (frontendDist) {
    app.use(express.static(frontendDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/chat') || req.path.startsWith('/decision') || req.path.startsWith('/health')) {
        return next();
      }
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  } else {
    app.get(['/', '/api'], (req, res) => {
      res.status(200).json({ status: 'ok', name: 'DecisionMate AI API', timestamp: new Date().toISOString() });
    });
  }

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
  });

  return app;
};

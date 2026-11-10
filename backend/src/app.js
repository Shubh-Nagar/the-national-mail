import fs from 'node:fs';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // let the frontend load /uploads
    })
  );
  app.use(
    cors({
      origin(origin, cb) {
        if (!origin || env.clientUrls.includes(origin)) return cb(null, true);
        cb(null, false);
      },
      credentials: true,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: '6mb' }));
  app.use(express.urlencoded({ extended: true }));
  if (!env.isProd) app.use(morgan('dev'));

  fs.mkdirSync(env.uploadDir, { recursive: true });
  app.use(
    '/uploads',
    express.static(env.uploadDir, {
      maxAge: '30d',
      immutable: true,
      setHeaders(res) {
        res.setHeader('X-Content-Type-Options', 'nosniff');
      },
    })
  );

  app.use('/api', routes);
  app.get('/', (_req, res) => res.json({ name: 'The National Mail API', docs: '/api/health' }));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

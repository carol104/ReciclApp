import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';

export function createServer(routes: express.Router) {
  const app = express();

  app.use(
    cors({
      origin: env.corsOrigin.length ? env.corsOrigin : true,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '2mb' }));

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use(routes);

  return app;
}

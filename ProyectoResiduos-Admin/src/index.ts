import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { env } from './config/env.js';
import { createRouter } from './presentation/router.js';
import { startAlertsScheduler } from './scheduler/alertsScheduler.js';
import { NotificationsService } from './services/notificationsService.js';

async function main() {
  const app = express();
  const service = new NotificationsService();

  app.use(
    cors({
      origin: env.corsOrigin.length ? env.corsOrigin : true,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));

  const publicPath = path.resolve(process.cwd(), 'public');
  app.use(express.static(publicPath));
  app.use(createRouter(service));

  app.get('/', (_req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });

  startAlertsScheduler(service);

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Admin module listening on http://localhost:${env.port}`);
  });
}

main().catch(error => {
  // eslint-disable-next-line no-console
  console.error('Fatal error in admin module:', error);
  process.exit(1);
});

import cron from 'node-cron';
import { NotificationsService } from '../services/notificationsService.js';

export function startAlertsScheduler(service: NotificationsService): void {
  cron.schedule('*/1 * * * *', async () => {
    try {
      const total = await service.dispatchScheduledAlerts();
      if (total > 0) {
        // eslint-disable-next-line no-console
        console.log(`[scheduler] Alertas programadas despachadas: ${total}`);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[scheduler] Error despachando alertas:', error);
    }
  });
}

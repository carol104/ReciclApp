import { Router } from 'express';
import { z } from 'zod';
import { requireAdminKey } from './requireAdminKey.js';
import { NotificationsService } from '../services/notificationsService.js';

const severitySchema = z.enum(['low', 'medium', 'high', 'critical']);

const registerDeviceSchema = z.object({
  token: z.string().min(10),
  platform: z.enum(['ios', 'android', 'web', 'unknown']).optional(),
  userId: z.string().optional(),
  userEmail: z.string().email().optional(),
  tags: z.array(z.string()).optional(),
});

const createAlertSchema = z.object({
  title: z.string().min(3),
  message: z.string().min(5),
  severity: severitySchema,
  tags: z.array(z.string()).optional(),
  sendPush: z.boolean().optional(),
  status: z.enum(['draft', 'scheduled', 'sent', 'cancelled']).optional(),
  scheduledFor: z.string().datetime().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

const updateAlertSchema = createAlertSchema.partial();

const customNotificationSchema = z.object({
  title: z.string().min(3),
  message: z.string().min(5),
  severity: severitySchema,
  tags: z.array(z.string()).optional(),
});

export function createRouter(service: NotificationsService): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'admin-notifications' });
  });

  router.post('/api/public/device-tokens', async (req, res) => {
    const parsed = registerDeviceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Payload inválido', issues: parsed.error.issues });
    }

    try {
      const device = await service.registerDevice(parsed.data);
      return res.status(201).json({ device });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo registrar dispositivo';
      return res.status(400).json({ message });
    }
  });

  router.get('/api/public/alerts/active', async (_req, res) => {
    const alerts = await service.getActiveAlerts();
    return res.json({ alerts });
  });

  router.use('/api/admin', requireAdminKey);

  router.get('/api/admin/alerts', async (_req, res) => {
    const alerts = await service.getAlerts();
    return res.json({ alerts });
  });

  router.post('/api/admin/alerts', async (req, res) => {
    const parsed = createAlertSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Payload inválido', issues: parsed.error.issues });
    }

    try {
      const alert = await service.createAlert(parsed.data);
      return res.status(201).json({ alert });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo crear alerta';
      return res.status(400).json({ message });
    }
  });

  router.patch('/api/admin/alerts/:id', async (req, res) => {
    const parsed = updateAlertSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Payload inválido', issues: parsed.error.issues });
    }

    try {
      const alert = await service.updateAlert(req.params.id, parsed.data);
      return res.json({ alert });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar alerta';
      return res.status(404).json({ message });
    }
  });

  router.delete('/api/admin/alerts/:id', async (req, res) => {
    try {
      const alert = await service.cancelAlert(req.params.id);
      return res.json({ alert });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo cancelar alerta';
      return res.status(404).json({ message });
    }
  });

  router.post('/api/admin/alerts/:id/dispatch', async (req, res) => {
    try {
      const result = await service.dispatchAlert(req.params.id);
      return res.json({ result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo despachar alerta';
      return res.status(404).json({ message });
    }
  });

  router.post('/api/admin/notifications/send', async (req, res) => {
    const parsed = customNotificationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Payload inválido', issues: parsed.error.issues });
    }

    try {
      const result = await service.sendCustomNotification(parsed.data);
      return res.json({ result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo enviar notificación';
      return res.status(500).json({ message });
    }
  });

  return router;
}

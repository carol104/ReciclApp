import { randomUUID } from 'node:crypto';
import { isExpoPushToken, sendExpoPushNotifications } from '../infra/expoPush.js';
import { readStore, updateStore } from '../infra/store.js';
import type {
  Alert,
  AlertSeverity,
  AlertStatus,
  DataShape,
  DeviceToken,
  NotificationRecord,
} from '../types.js';

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeTags(tags: string[] | undefined): string[] {
  return [...new Set((tags ?? []).map(tag => tag.trim().toLowerCase()).filter(Boolean))];
}

function hasAnyTag(sourceTags: string[], filterTags: string[]): boolean {
  if (!filterTags.length) {
    return true;
  }

  return sourceTags.some(tag => filterTags.includes(tag));
}

function mapById<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map(item => [item.id, item]));
}

type CreateAlertInput = {
  title: string;
  message: string;
  severity: AlertSeverity;
  tags?: string[];
  sendPush?: boolean;
  status?: AlertStatus;
  scheduledFor?: string | null;
  expiresAt?: string | null;
};

type UpdateAlertInput = Partial<CreateAlertInput>;

type RegisterDeviceInput = {
  token: string;
  platform?: 'ios' | 'android' | 'web' | 'unknown';
  userId?: string;
  userEmail?: string;
  tags?: string[];
};

type SendCustomInput = {
  title: string;
  message: string;
  severity: AlertSeverity;
  tags?: string[];
};

export class NotificationsService {
  async registerDevice(input: RegisterDeviceInput): Promise<DeviceToken> {
    if (!isExpoPushToken(input.token)) {
      throw new Error('Token Expo inválido');
    }

    const normalizedTags = normalizeTags(input.tags);
    const currentTime = nowIso();

    let registered: DeviceToken | null = null;

    await updateStore((current: DataShape) => {
      const existing = current.devices.find(device => device.token === input.token);

      if (existing) {
        existing.active = true;
        existing.platform = input.platform ?? existing.platform;
        existing.userId = input.userId ?? existing.userId;
        existing.userEmail = input.userEmail ?? existing.userEmail;
        existing.tags = normalizeTags([...existing.tags, ...normalizedTags]);
        existing.lastSeenAt = currentTime;
        existing.lastError = null;
        registered = existing;
      } else {
        registered = {
          id: randomUUID(),
          token: input.token,
          platform: input.platform ?? 'unknown',
          userId: input.userId,
          userEmail: input.userEmail,
          tags: normalizedTags,
          active: true,
          createdAt: currentTime,
          lastSeenAt: currentTime,
          lastError: null,
        };
        current.devices.push(registered);
      }

      return current;
    });

    if (!registered) {
      throw new Error('No fue posible registrar dispositivo');
    }

    return registered;
  }

  async getAlerts(): Promise<Alert[]> {
    const store = await readStore();
    return [...store.alerts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getActiveAlerts(): Promise<Alert[]> {
    const now = Date.now();
    const store = await readStore();

    return store.alerts.filter(alert => {
      if (alert.status !== 'sent') {
        return false;
      }

      if (!alert.expiresAt) {
        return true;
      }

      return new Date(alert.expiresAt).getTime() > now;
    });
  }

  async createAlert(input: CreateAlertInput): Promise<Alert> {
    const timestamp = nowIso();
    const alert: Alert = {
      id: randomUUID(),
      title: input.title,
      message: input.message,
      severity: input.severity,
      tags: normalizeTags(input.tags),
      sendPush: input.sendPush ?? true,
      status: input.status ?? 'draft',
      scheduledFor: input.scheduledFor ?? null,
      expiresAt: input.expiresAt ?? null,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastDispatchedAt: null,
    };

    await updateStore(current => {
      current.alerts.push(alert);
      return current;
    });

    return alert;
  }

  async updateAlert(alertId: string, input: UpdateAlertInput): Promise<Alert> {
    let updated: Alert | null = null;

    await updateStore(current => {
      const alert = current.alerts.find(item => item.id === alertId);
      if (!alert) {
        throw new Error('Alerta no encontrada');
      }

      alert.title = input.title ?? alert.title;
      alert.message = input.message ?? alert.message;
      alert.severity = input.severity ?? alert.severity;
      alert.tags = input.tags ? normalizeTags(input.tags) : alert.tags;
      alert.sendPush = input.sendPush ?? alert.sendPush;
      alert.status = input.status ?? alert.status;
      alert.scheduledFor = input.scheduledFor === undefined ? alert.scheduledFor : input.scheduledFor;
      alert.expiresAt = input.expiresAt === undefined ? alert.expiresAt : input.expiresAt;
      alert.updatedAt = nowIso();

      updated = alert;
      return current;
    });

    if (!updated) {
      throw new Error('No fue posible actualizar la alerta');
    }

    return updated;
  }

  async cancelAlert(alertId: string): Promise<Alert> {
    return await this.updateAlert(alertId, { status: 'cancelled' });
  }

  async dispatchAlert(alertId: string): Promise<NotificationRecord> {
    const store = await readStore();
    const alert = store.alerts.find(item => item.id === alertId);
    if (!alert) {
      throw new Error('Alerta no encontrada');
    }

    const result = await this.sendToAudience({
      alertId: alert.id,
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      tags: alert.tags,
      sendPush: alert.sendPush,
    });

    await updateStore(current => {
      const alertToUpdate = current.alerts.find(item => item.id === alertId);
      if (alertToUpdate) {
        alertToUpdate.status = 'sent';
        alertToUpdate.lastDispatchedAt = result.sentAt;
        alertToUpdate.updatedAt = nowIso();
      }

      return current;
    });

    return result;
  }

  async sendCustomNotification(input: SendCustomInput): Promise<NotificationRecord> {
    return await this.sendToAudience({
      title: input.title,
      message: input.message,
      severity: input.severity,
      tags: normalizeTags(input.tags),
      sendPush: true,
    });
  }

  async dispatchScheduledAlerts(): Promise<number> {
    const now = Date.now();
    const store = await readStore();

    const dueAlerts = store.alerts.filter(alert => {
      if (alert.status !== 'scheduled') {
        return false;
      }

      if (!alert.scheduledFor) {
        return false;
      }

      return new Date(alert.scheduledFor).getTime() <= now;
    });

    for (const alert of dueAlerts) {
      await this.dispatchAlert(alert.id);
    }

    return dueAlerts.length;
  }

  private async sendToAudience(input: {
    alertId?: string;
    title: string;
    message: string;
    severity: AlertSeverity;
    tags: string[];
    sendPush: boolean;
  }): Promise<NotificationRecord> {
    const sentAt = nowIso();
    const normalizedTags = normalizeTags(input.tags);

    const store = await readStore();
    const targetDevices = store.devices.filter(device => {
      if (!device.active) {
        return false;
      }

      return hasAnyTag(device.tags, normalizedTags);
    });

    let successCount = 0;
    let failureCount = 0;
    const deviceById = mapById(targetDevices);

    if (input.sendPush && targetDevices.length > 0) {
      const tickets = await sendExpoPushNotifications(
        targetDevices.map(device => ({
          to: device.token,
          title: input.title,
          body: input.message,
          sound: 'default' as const,
          data: {
            severity: input.severity,
            tags: normalizedTags,
            alertId: input.alertId,
          },
        }))
      );

      tickets.forEach((ticket, index) => {
        const target = targetDevices[index];
        if (!target) {
          return;
        }

        const device = deviceById.get(target.id);
        if (!device) {
          return;
        }

        if (ticket.status === 'ok') {
          successCount += 1;
          device.lastError = null;
          return;
        }

        failureCount += 1;
        const errorCode = ticket.details?.error ?? ticket.message ?? 'push_failed';
        device.lastError = errorCode;

        if (errorCode.includes('DeviceNotRegistered')) {
          device.active = false;
        }
      });
    }

    const record: NotificationRecord = {
      id: randomUUID(),
      alertId: input.alertId,
      title: input.title,
      message: input.message,
      severity: input.severity,
      tags: normalizedTags,
      sentAt,
      totalTargets: targetDevices.length,
      successCount,
      failureCount,
    };

    await updateStore(current => {
      const devicesByToken = new Map(current.devices.map(device => [device.token, device]));

      for (const device of targetDevices) {
        const target = devicesByToken.get(device.token);
        if (!target) {
          continue;
        }

        target.lastSeenAt = sentAt;
        target.lastError = device.lastError;
        target.active = device.active;
      }

      current.notifications.push(record);
      return current;
    });

    return record;
  }
}

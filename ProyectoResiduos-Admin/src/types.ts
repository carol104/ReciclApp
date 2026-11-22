export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'draft' | 'scheduled' | 'sent' | 'cancelled';

export type Alert = {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  tags: string[];
  sendPush: boolean;
  status: AlertStatus;
  scheduledFor: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastDispatchedAt: string | null;
};

export type DeviceToken = {
  id: string;
  token: string;
  platform: 'ios' | 'android' | 'web' | 'unknown';
  userId?: string;
  userEmail?: string;
  tags: string[];
  active: boolean;
  createdAt: string;
  lastSeenAt: string;
  lastError: string | null;
};

export type NotificationRecord = {
  id: string;
  alertId?: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  tags: string[];
  sentAt: string;
  totalTargets: number;
  successCount: number;
  failureCount: number;
};

export type DataShape = {
  alerts: Alert[];
  devices: DeviceToken[];
  notifications: NotificationRecord[];
};

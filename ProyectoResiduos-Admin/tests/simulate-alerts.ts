/// <reference types="node" />
const API = 'http://localhost:4100';
const ADMIN_KEY = process.env.ADMIN_API_KEY ?? 'admin-dev-key';

async function request(path: string, init?: RequestInit) {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return { response, data };
}

async function main() {
  const device = await request('/api/public/device-tokens', {
    method: 'POST',
    body: JSON.stringify({
      token: 'ExpoPushToken[simCitizenCenter001]',
      platform: 'android',
      userId: 'sim-user-1',
      userEmail: 'sim@ciudadano.com',
      tags: ['ciudadanos', 'centro'],
    }),
  });

  const alert = await request('/api/admin/alerts', {
    method: 'POST',
    headers: {
      'x-admin-key': ADMIN_KEY,
    },
    body: JSON.stringify({
      title: 'Simulacion punto critico',
      message: 'Saturacion detectada en punto de acopio Centro.',
      severity: 'critical',
      tags: ['centro'],
      sendPush: true,
      status: 'scheduled',
      scheduledFor: new Date(Date.now() - 5_000).toISOString(),
    }),
  });

  const alertId = (alert.data.alert as { id?: string } | undefined)?.id;

  if (!alertId) {
    throw new Error('No se pudo crear alerta de simulacion');
  }

  const dispatch = await request(`/api/admin/alerts/${alertId}/dispatch`, {
    method: 'POST',
    headers: {
      'x-admin-key': ADMIN_KEY,
    },
  });

  const active = await request('/api/public/alerts/active');

  const summary = {
    registerStatus: device.response.status,
    alertStatus: alert.response.status,
    dispatchStatus: dispatch.response.status,
    activeStatus: active.response.status,
    dispatchResult: dispatch.data,
    activeCount: Array.isArray(active.data.alerts) ? active.data.alerts.length : 0,
  };

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(summary, null, 2));
}

main().catch(error => {
  // eslint-disable-next-line no-console
  console.error('Simulation failed:', error);
  process.exit(1);
});

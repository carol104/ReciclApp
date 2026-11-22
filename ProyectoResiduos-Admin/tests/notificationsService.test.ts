/// <reference types="node" />
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const originalCwd = process.cwd();
let tmpRoot = '';
let NotificationsServiceClass: any;

async function resetStore() {
  const dataDir = path.join(tmpRoot, 'data');
  const storePath = path.join(dataDir, 'store.json');
  await mkdir(dataDir, { recursive: true });
  await writeFile(
    storePath,
    JSON.stringify({ alerts: [], devices: [], notifications: [] }, null, 2),
    'utf8'
  );
}

async function readStoreJson() {
  const storePath = path.join(tmpRoot, 'data', 'store.json');
  const raw = await readFile(storePath, 'utf8');
  return JSON.parse(raw) as {
    alerts: Array<Record<string, unknown>>;
    devices: Array<Record<string, unknown>>;
    notifications: Array<Record<string, unknown>>;
  };
}

before(async () => {
  tmpRoot = await mkdtemp(path.join(tmpdir(), 'residuos-admin-test-'));
  process.chdir(tmpRoot);
  const module = await import('../src/services/notificationsService.js');
  NotificationsServiceClass = module.NotificationsService;
});

after(() => {
  process.chdir(originalCwd);
});

describe('NotificationsService', () => {
  it('rechaza token Expo invalido', async () => {
    await resetStore();
    const service = new NotificationsServiceClass();

    await assert.rejects(
      service.registerDevice({ token: 'bad-token' }),
      /Token Expo invalido|Token Expo inválido/
    );
  });

  it('registra y actualiza un dispositivo combinando tags', async () => {
    await resetStore();
    const service = new NotificationsServiceClass();

    const first = await service.registerDevice({
      token: 'ExpoPushToken[abc123XYZ_1]',
      platform: 'android',
      tags: ['Centro', 'Ciudadanos'],
    });

    const second = await service.registerDevice({
      token: 'ExpoPushToken[abc123XYZ_1]',
      platform: 'android',
      tags: ['centro', 'NORTE'],
    });

    assert.equal(first.token, second.token);

    const store = await readStoreJson();
    assert.equal(store.devices.length, 1);
    assert.deepEqual(store.devices[0].tags, ['centro', 'ciudadanos', 'norte']);
  });

  it('filtra alertas activas: solo enviadas y no expiradas', async () => {
    await resetStore();
    const service = new NotificationsServiceClass();

    const now = Date.now();
    await service.createAlert({
      title: 'Borrador',
      message: 'No debe salir',
      severity: 'low',
      status: 'draft',
    });

    await service.createAlert({
      title: 'Expirada',
      message: 'No debe salir',
      severity: 'high',
      status: 'sent',
      expiresAt: new Date(now - 10_000).toISOString(),
    });

    await service.createAlert({
      title: 'Activa',
      message: 'Debe salir',
      severity: 'critical',
      status: 'sent',
      expiresAt: new Date(now + 60_000).toISOString(),
    });

    const active = await service.getActiveAlerts();
    assert.equal(active.length, 1);
    assert.equal(active[0].title, 'Activa');
  });

  it('despacha alerta programada y guarda resultado de envio push', async () => {
    await resetStore();
    const service = new NotificationsServiceClass();

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      return {
        ok: true,
        json: async () => ({ data: [{ status: 'ok', id: 'ticket-1' }] }),
      } as Response;
    }) as typeof fetch;

    try {
      await service.registerDevice({
        token: 'ExpoPushToken[device_dispatch_1]',
        platform: 'android',
        tags: ['ciudadanos', 'centro'],
      });

      await service.createAlert({
        title: 'Programada Centro',
        message: 'Evento en zona centro',
        severity: 'high',
        status: 'scheduled',
        tags: ['centro'],
        scheduledFor: new Date(Date.now() - 1_000).toISOString(),
      });

      const total = await service.dispatchScheduledAlerts();
      assert.equal(total, 1);

      const store = await readStoreJson();
      assert.equal(store.notifications.length, 1);
      assert.equal(store.notifications[0].successCount, 1);
      assert.equal(store.notifications[0].failureCount, 0);
      assert.equal(store.alerts[0].status, 'sent');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { DataShape } from '../types.js';

const DATA_PATH = path.resolve(process.cwd(), 'data', 'store.json');

const EMPTY_DATA: DataShape = {
  alerts: [],
  devices: [],
  notifications: [],
};

let writeQueue = Promise.resolve();

async function ensureStoreExists(): Promise<void> {
  await mkdir(path.dirname(DATA_PATH), { recursive: true });

  try {
    await readFile(DATA_PATH, 'utf8');
  } catch {
    await writeFile(DATA_PATH, JSON.stringify(EMPTY_DATA, null, 2), 'utf8');
  }
}

export async function readStore(): Promise<DataShape> {
  await ensureStoreExists();
  const raw = await readFile(DATA_PATH, 'utf8');
  const parsed = JSON.parse(raw) as DataShape;
  return {
    alerts: parsed.alerts ?? [],
    devices: parsed.devices ?? [],
    notifications: parsed.notifications ?? [],
  };
}

export async function updateStore(
  updater: (current: DataShape) => DataShape
): Promise<DataShape> {
  writeQueue = writeQueue.then(async () => {
    const current = await readStore();
    const next = updater(current);
    await writeFile(DATA_PATH, JSON.stringify(next, null, 2), 'utf8');
  });

  await writeQueue;
  return await readStore();
}

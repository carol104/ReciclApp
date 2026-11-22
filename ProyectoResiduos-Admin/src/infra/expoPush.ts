type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  sound: 'default';
  data?: Record<string, unknown>;
};

type ExpoPushTicket = {
  id?: string;
  status: 'ok' | 'error';
  message?: string;
  details?: { error?: string };
};

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const MAX_CHUNK_SIZE = 100;

function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
}

export function isExpoPushToken(token: string): boolean {
  return /^ExponentPushToken\[[A-Za-z0-9-_]+\]$/.test(token) || /^ExpoPushToken\[[A-Za-z0-9-_]+\]$/.test(token);
}

export async function sendExpoPushNotifications(messages: ExpoPushMessage[]): Promise<ExpoPushTicket[]> {
  const tickets: ExpoPushTicket[] = [];
  const chunks = chunkArray(messages, MAX_CHUNK_SIZE);

  for (const chunk of chunks) {
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chunk),
    });

    const payload = (await response.json().catch(() => ({}))) as { data?: ExpoPushTicket[] };
    if (!response.ok) {
      for (let i = 0; i < chunk.length; i += 1) {
        tickets.push({
          status: 'error',
          message: 'Expo push request failed',
        });
      }
      continue;
    }

    tickets.push(...(payload.data ?? []));
  }

  return tickets;
}

import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4100),
  adminApiKey: required('ADMIN_API_KEY'),
  corsOrigin: (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean),
};

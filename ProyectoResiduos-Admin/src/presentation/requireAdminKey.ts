import type { RequestHandler } from 'express';
import { env } from '../config/env.js';

export const requireAdminKey: RequestHandler = (req, res, next) => {
  const key = req.header('x-admin-key');

  if (!key || key !== env.adminApiKey) {
    return res.status(401).json({ message: 'No autorizado para módulo admin' });
  }

  return next();
};

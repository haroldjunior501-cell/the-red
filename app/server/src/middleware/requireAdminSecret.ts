import type { NextFunction, Request, Response } from 'express';

export function requireAdminSecret(req: Request, res: Response, next: NextFunction) {
  const secret = process.env.SIMULATOR_ADMIN_SECRET?.trim();
  if (!secret) {
    res.status(503).json({ error: 'SIMULATOR_ADMIN_SECRET non configuré sur le serveur' });
    return;
  }
  const header = req.headers['x-goalya-admin-secret'];
  if (header !== secret) {
    res.status(401).json({ error: 'Secret admin invalide' });
    return;
  }
  next();
}

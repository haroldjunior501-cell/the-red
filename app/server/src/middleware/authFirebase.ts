import type { NextFunction, Request, Response } from 'express';
import { getAuth } from '../firebaseAdmin.js';

export type AuthedRequest = Request & { uid: string };

export async function requireFirebaseAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentification requise' });
    return;
  }
  const token = header.slice(7).trim();
  if (!token) {
    res.status(401).json({ error: 'Token manquant' });
    return;
  }
  try {
    const decoded = await getAuth().verifyIdToken(token);
    (req as AuthedRequest).uid = decoded.uid;
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

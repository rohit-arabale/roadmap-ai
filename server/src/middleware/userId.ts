import type { Request, Response, NextFunction } from 'express';

export function userIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  let userId: string;
  const header = req.headers['x-user-id'];
  if (typeof header === 'string' && header.trim() !== '') {
    userId = header.trim();
  } else {
    userId = `anon-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
  (req as Request & { userId: string }).userId = userId;
  res.setHeader('X-User-Id', userId);
  next();
}

export function getUserId(req: Request): string {
  const uid = (req as Request & { userId?: string }).userId;
  if (!uid) throw new Error('userId middleware not applied');
  return uid;
}

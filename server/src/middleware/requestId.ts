import type { Request, Response, NextFunction } from 'express';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const id = req.headers['x-request-id'] as string | undefined;
  const requestId = id && id.trim() !== '' ? id.trim().slice(0, 64) : crypto.randomUUID();
  (req as Request & { requestId: string }).requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
}

export function getRequestId(req: Request): string {
  return (req as Request & { requestId?: string }).requestId ?? 'unknown';
}

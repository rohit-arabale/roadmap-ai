import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { config } from '../config.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
    });
    return;
  }

  if (err instanceof Error) {
    const status = (err as Error & { status?: number; code?: string }).status ?? 500;
    const code = (err as Error & { code?: string }).code;
    if (code === 'EBADCSRFTOKEN') {
      res.status(403).json({ success: false, error: 'Invalid CSRF token' });
      return;
    }
    if (err.message === 'request entity too large' || code === 'LIMIT_FILE_SIZE' || status === 413) {
      res.status(413).json({ success: false, error: 'Payload too large' });
      return;
    }
    const isCors = err.message.startsWith('CORS blocked');
    if (isCors) {
      res.status(403).json({ success: false, error: err.message });
      return;
    }
    if (status >= 400 && status < 500) {
      console.warn(`[warn] ${err.message}`);
      res.status(status).json({ success: false, error: err.message });
      return;
    }
    console.error(`[error] ${err.message}`, config.nodeEnv === 'development' ? err.stack : '');
    const message = config.nodeEnv === 'production' ? 'Internal server error' : err.message;
    res.status(status).json({ success: false, error: message });
    return;
  }

  console.error('[error] Unknown error', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ success: false, error: 'Not found' });
}

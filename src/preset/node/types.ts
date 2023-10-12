import type { Request, Response, NextFunction } from 'express';

/**
 * Контекст обработчика express.
 */
export interface HandlerContext {
  req: Request;
  res: Response;
  next: NextFunction;
}

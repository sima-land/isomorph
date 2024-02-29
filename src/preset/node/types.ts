import type { Request, Response, NextFunction } from 'express';

/**
 * Контекст обработчика express.
 */
export interface ExpressHandlerContext {
  req: Request;
  res: Response;
  next: NextFunction;
}

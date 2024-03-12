import type { Request, Response, NextFunction } from 'express';

/**
 * Контекст обработчика express.
 */
export interface ExpressHandlerContext {
  readonly req: Request;
  readonly res: Response;
  readonly next: NextFunction;
}

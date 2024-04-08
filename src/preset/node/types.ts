import type express from 'express';
import type { RouteInfo } from '../server/types';

/**
 * Контекст обработчика express.
 */
export interface ExpressHandlerContext {
  readonly req: express.Request;
  readonly res: express.Response;
  readonly next: express.NextFunction;
}

export type ExpressRouteList = Array<[string | RouteInfo, express.Handler]>;

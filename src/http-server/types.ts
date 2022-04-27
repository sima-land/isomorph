import type { Request, Response, NextFunction, Handler, ErrorRequestHandler } from 'express';

export interface ResponseContext {
  req: Request;
  res: Response;
  next: NextFunction;
}

export interface PageAssets {
  js: string;
  css: string;
}

export interface ConventionalJson {
  markup: string;
  bundle_js: string;
  bundle_css: string;
  critical_js?: string;
  critical_css?: string;
  meta?: any;
}

export interface DefaultMiddleware {
  start: Handler[];
  logging: Handler[];
  tracing: Handler[];
  metrics: Handler[];
  finish: Array<Handler | ErrorRequestHandler>;
}

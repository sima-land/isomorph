import type { Handler } from 'express';

export interface ConventionalJson {
  markup: string;
  bundle_js: string;
  bundle_css: string;
}

export interface DefaultMiddleware {
  logging: Handler[];
  tracing: Handler[];
  metrics: Handler[];
}

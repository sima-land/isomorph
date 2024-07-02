import { withIsolationScope } from '@sentry/browser';
import type express from 'express';

/**
 * Провайдер промежуточного слоя учета входящих http-запросов.
 * @return Промежуточный слой.
 */
export function provideExpressRequestMiddleware(): express.Handler {
  return (req, res, next) => {
    withIsolationScope(() => {
      next();
    });
  };
}

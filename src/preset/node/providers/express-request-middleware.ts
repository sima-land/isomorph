import { withIsolationScope } from '@sentry/node';
import type express from 'express';

/**
 * Провайдер промежуточного слоя учета входящих http-запросов.
 * @return Промежуточный слой.
 */
export function provideExpressRequestMiddleware(): express.Handler {
  // https://github.com/getsentry/sentry-javascript/discussions/9618#discussioncomment-9950984
  return (req, res, next) => {
    withIsolationScope(() => {
      next();
    });
  };
}

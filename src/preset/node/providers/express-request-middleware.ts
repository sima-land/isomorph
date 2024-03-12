import type express from 'express';
import { Handlers } from '@sentry/node';

/**
 * Провайдер промежуточного слоя учета входящих http-запросов.
 * @return Промежуточный слой.
 */
export function provideExpressRequestMiddleware(): express.Handler {
  return Handlers.requestHandler();
}

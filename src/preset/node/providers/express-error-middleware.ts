import { expressErrorHandler } from '@sentry/node';
import type express from 'express';

/**
 * Провайдер промежуточного слоя обработки ошибок в рамках ответ на http-запросы.
 * @return Промежуточный слой.
 */
export function provideExpressErrorMiddleware(): express.ErrorRequestHandler {
  return expressErrorHandler();
}

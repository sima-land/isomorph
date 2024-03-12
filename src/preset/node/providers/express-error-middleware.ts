import type express from 'express';
import { Handlers } from '@sentry/node';

/**
 * Провайдер промежуточного слоя обработки ошибок в рамках ответ на http-запросы.
 * @return Промежуточный слой.
 */
export function provideExpressErrorMiddleware(): express.ErrorRequestHandler {
  return Handlers.errorHandler();
}

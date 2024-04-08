/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import { runWithAsyncContext } from '@sentry/bun';
import { ServerMiddleware } from '../../server/types';
import { getServeLogging } from '../../server/utils/get-serve-logging';
import { getServeErrorLogging } from '../../server/utils/get-serve-error-logging';
import { getServeMeasuring } from '../../node/utils/get-serve-measuring';

export function provideServeMiddleware(resolve: Resolve): ServerMiddleware[] {
  const config = resolve(KnownToken.Config.base);
  const logger = resolve(KnownToken.logger);

  return [
    // ВАЖНО: изолируем хлебные крошки чтобы они группировались по входящим запросам
    (request, next) => runWithAsyncContext(async () => next(request)),

    // ВАЖНО: слой логирования ошибки ПЕРЕД остальными слоями чтобы не упустить ошибки выше
    getServeErrorLogging(logger),

    // @todo tracing

    // метрики
    getServeMeasuring(config),

    // ВАЖНО: слой логирования запроса и ответа ПОСЛЕ остальных слоев чтобы использовать актуальные данные
    getServeLogging(logger),
  ];
}

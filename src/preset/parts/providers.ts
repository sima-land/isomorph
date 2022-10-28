/* eslint-disable require-jsdoc, jsdoc/require-jsdoc  */
import { createBaseConfig } from '../../config/base';
import { BaseConfig } from '../../config/types';
import { Resolve } from '../../di';
import { LogMiddlewareHandlerInit } from '../../http-client/middleware/logging';
import { KnownToken } from '../../tokens';
import { createSagaMiddleware, SagaExtendedMiddleware } from '../../utils/redux-saga';
import { HttpClientLogHandler } from './utils';

export function provideBaseConfig(resolve: Resolve): BaseConfig {
  const source = resolve(KnownToken.Config.source);

  return createBaseConfig(source);
}

export function provideSagaMiddleware(resolve: Resolve): SagaExtendedMiddleware {
  const logger = resolve(KnownToken.logger);

  return createSagaMiddleware(logger);
}

export function provideHttpClientLogHandler(resolve: Resolve): LogMiddlewareHandlerInit {
  const logger = resolve(KnownToken.logger);

  return function getLogHandler(data) {
    return new HttpClientLogHandler(logger, data);
  };
}
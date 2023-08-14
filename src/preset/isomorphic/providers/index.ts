import { createBaseConfig } from '../../../config/base';
import { BaseConfig } from '../../../config/types';
import { Resolve } from '../../../di';
import { LogMiddlewareHandlerInit } from '../../../utils/axios/middleware/log';
import { KnownToken } from '../../../tokens';
import { createSagaMiddleware, SagaExtendedMiddleware } from '../../../utils/redux-saga';
import { HttpClientLogging, SagaLogging } from '../utils';

/**
 * Провайдер базовой конфигурации приложения.
 * @param resolve Функция для получения зависимости по токену.
 * @return Базовая конфигурация.
 */
export function provideBaseConfig(resolve: Resolve): BaseConfig {
  const source = resolve(KnownToken.Config.source);

  return createBaseConfig(source);
}

/**
 * Провайдер кастомной версии createSagaMiddleware из redux-saga.
 * @param resolve Функция для получения зависимости по токену.
 * @return Промежуточный слой для redux-хранилища.
 */
export function provideSagaMiddleware(resolve: Resolve): SagaExtendedMiddleware {
  const logger = resolve(KnownToken.logger);

  return createSagaMiddleware(new SagaLogging(logger));
}

/**
 * Провайдер обработчика логирования исходящих http-запросов.
 * @param resolve Функция для получения зависимости по токену.
 * @return Обработчик.
 */
export function provideHttpClientLogHandler(resolve: Resolve): LogMiddlewareHandlerInit {
  const logger = resolve(KnownToken.logger);

  return data => new HttpClientLogging(logger, data);
}

import { createBaseConfig } from '../../../config/base';
import { BaseConfig } from '../../../config/types';
import { Resolve } from '../../../di';
import { LogMiddlewareHandlerInit } from '../../../utils/axios/middleware/log';
import { KnownToken } from '../../../tokens';
import { HttpClientLogging, SagaLogging } from '../utils';
import createSagaMiddleware, { SagaMiddleware } from 'redux-saga';

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
 * Провайдер обработчика логирования исходящих http-запросов.
 * @param resolve Функция для получения зависимости по токену.
 * @return Обработчик.
 */
export function provideAxiosLogHandler(resolve: Resolve): LogMiddlewareHandlerInit {
  const logger = resolve(KnownToken.logger);

  return data => new HttpClientLogging(logger, data);
}

/**
 * Провайдер промежуточного слоя redux-saga для redux-хранилища.
 * @param resolve Функция для получения зависимости по токену.
 * @return Промежуточный слой для redux-хранилища.
 */
export function provideReduxSagaMiddleware(resolve: Resolve): SagaMiddleware {
  const logger = resolve(KnownToken.logger);

  const logHandler = new SagaLogging(logger);

  return createSagaMiddleware({
    /** @inheritdoc */
    onError(error, errorInfo) {
      logHandler.onSagaError(error, errorInfo);
    },
  });
}

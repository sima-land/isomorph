import { createBaseConfig } from '../../../config/base';
import { BaseConfig } from '../../../config/types';
import { Resolve } from '../../../di';
import { LogMiddlewareHandlerInit } from '../../../utils/axios/middleware/log';
import { KnownToken } from '../../../tokens';
import { AxiosLogging } from '../utils/axios-logging';
import { SagaLogging } from '../utils/saga-logging';
import createSagaMiddleware, { SagaMiddleware } from 'redux-saga';
import { applyMiddleware, configureFetch } from '../../../http';
import { CreateAxiosDefaults } from 'axios';
import { create } from 'middleware-axios';

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
 * Провайдер AbortController.
 * @return AbortController.
 */
export function provideAbortController(): AbortController {
  return new AbortController();
}

/**
 * Провайдер функции fetch.
 * @param resolve Функция для получения зависимости по токену.
 * @return Функция fetch.
 */
export function provideFetch(resolve: Resolve) {
  const middleware = resolve(KnownToken.Http.Fetch.middleware);

  return configureFetch(fetch, applyMiddleware(...middleware));
}

/**
 * Провайдер фабрики экземпляров AxiosInstanceWrapper.
 * @param resolve Функция для получения зависимости по токену.
 * @return Фабрика.
 */
export function provideAxiosFactory(resolve: Resolve) {
  const middleware = resolve(KnownToken.Axios.middleware);

  return (config: CreateAxiosDefaults = {}) => {
    const client = create(config as any); // @todo убрать as any

    for (const item of middleware) {
      client.use(item);
    }

    return client;
  };
}

/**
 * Провайдер обработчика логирования исходящих http-запросов.
 * @param resolve Функция для получения зависимости по токену.
 * @return Обработчик.
 */
export function provideAxiosLogHandler(resolve: Resolve): LogMiddlewareHandlerInit {
  const logger = resolve(KnownToken.logger);

  return data => new AxiosLogging(logger, data);
}

/**
 * Провайдер промежуточного слоя redux-saga для redux-хранилища.
 * @param resolve Функция для получения зависимости по токену.
 * @return Промежуточный слой для redux-хранилища.
 */
export function provideReduxMiddlewareSaga(resolve: Resolve): SagaMiddleware {
  const logger = resolve(KnownToken.logger);

  const logHandler = new SagaLogging(logger);

  return createSagaMiddleware({
    /** @inheritdoc */
    onError(error, errorInfo) {
      logHandler.onSagaError(error, errorInfo);
    },
  });
}

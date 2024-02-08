import {
  BrowserClient,
  Hub,
  defaultIntegrations,
  defaultStackParser,
  makeFetchTransport,
} from '@sentry/browser';
import { ConfigSource, createConfigSource } from '../../../config';
import { Resolve } from '../../../di';
import { Logger, createLogger } from '../../../log';
import { KnownToken } from '../../../tokens';
import { createSentryHandler } from '../../../log/handler/sentry';
import { BridgeClientSide, SsrBridge } from '../../../utils/ssr';
import { KnownHttpApiKey } from '../../isomorphic/types';
import { FetchLogging, HttpApiHostPool, HttpStatus } from '../../isomorphic/utils';
import { logMiddleware } from '../../../utils/axios';
import { log } from '../../../http';

/**
 * Провайдер источника конфигурации.
 * @return Источник конфигурации.
 */
export function provideConfigSource(): ConfigSource {
  // ВАЖНО: по умолчанию рассчитываем на process.env который предоставляется сборщиком (например webpack)
  if (typeof process !== 'undefined' && process.env) {
    return createConfigSource(process.env);
  }

  return createConfigSource({});
}

/**
 * Провайдер Logger'а.
 * @param resolve Функция для получения зависимости по токену.
 * @return Logger.
 */
export function provideLogger(resolve: Resolve): Logger {
  const source = resolve(KnownToken.Config.source);
  const config = resolve(KnownToken.Config.base);

  const client = new BrowserClient({
    transport: makeFetchTransport,
    stackParser: defaultStackParser,
    dsn: source.require('PUBLIC_SENTRY_DSN'),
    release: source.require('SENTRY_RELEASE'),
    environment: source.require('PUBLIC_SENTRY_ENVIRONMENT'),
    integrations: [...defaultIntegrations],
  });

  const hub = new Hub(client);

  hub.setTag('url', window.location.href);

  const logger = createLogger();

  logger.subscribe(createSentryHandler(hub));

  if (config.env === 'development') {
    logger.subscribe(event => {
      switch (event.type) {
        case 'debug':
          // eslint-disable-next-line no-console
          console.debug(event.data);
          break;
        case 'error':
          // eslint-disable-next-line no-console
          console.error(event.data);
          break;
      }
    });
  }

  return logger;
}

/**
 * Провайдер клиентской части "моста" для передачи данных между сервером и клиентом.
 * @param resolve Функция для получения зависимости по токену.
 * @return Клиентская часть "моста".
 */
export function provideBridgeClientSide(resolve: Resolve): BridgeClientSide<unknown> {
  const config = resolve(KnownToken.Config.base);

  return SsrBridge.resolve(config.appName);
}

/**
 * Провайдер известных http-хостов.
 * @param resolve Функция для получения зависимости по токену.
 * @return Пул известных http-хостов.
 */
export function provideKnownHttpApiHosts(resolve: Resolve): HttpApiHostPool<KnownHttpApiKey> {
  const source = resolve(KnownToken.Config.source);

  return new HttpApiHostPool<KnownHttpApiKey>(
    {
      ilium: 'PUBLIC_API_URL_ILIUM',
      simaV3: 'PUBLIC_API_URL_SIMALAND_V3',
      simaV4: 'PUBLIC_API_URL_SIMALAND_V4',
      simaV6: 'PUBLIC_API_URL_SIMALAND_V6',
      chponkiV2: 'PUBLIC_API_URL_CHPONKI_V2',
    },
    source,
  );
}

/**
 * Провайдер промежуточных слоев для fetch.
 * @param resolve Функция для получения зависимости по токену.
 * @return Фабрика.
 */
export function provideFetchMiddleware(resolve: Resolve) {
  const logger = resolve(KnownToken.logger);

  return [log(new FetchLogging(logger))];
}

/**
 * Провайдер фабрики http-клиентов.
 * @param resolve Функция для получения зависимости по токену.
 * @return Фабрика.
 */
export function provideAxiosMiddleware(resolve: Resolve) {
  const logHandler = resolve(KnownToken.Axios.Middleware.Log.handler);

  return [HttpStatus.axiosMiddleware(), logMiddleware(logHandler)];
}

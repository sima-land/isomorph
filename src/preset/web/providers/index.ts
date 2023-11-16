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
import { KnownHttpApiKey, StrictMap } from '../../isomorphic/types';
import { HttpApiHostPool, HttpStatus } from '../../isomorphic/utils';
import { CreateAxiosDefaults } from 'axios';
import { create } from 'middleware-axios';
import { logMiddleware } from '../../../utils/axios';

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
export function provideKnownHttpApiHosts(resolve: Resolve): StrictMap<KnownHttpApiKey> {
  const source = resolve(KnownToken.Config.source);

  return new HttpApiHostPool<KnownHttpApiKey>(
    {
      ilium: 'PUBLIC_API_URL_ILIUM',
      simaV3: 'PUBLIC_API_URL_SIMALAND_V3',
      simaV4: 'PUBLIC_API_URL_SIMALAND_V4',
      simaV6: 'PUBLIC_API_URL_SIMALAND_V6',
    },
    source,
  );
}

/**
 * Провайдер фабрики http-клиентов.
 * @param resolve Функция для получения зависимости по токену.
 * @return Фабрика.
 */
export function provideHttpClientFactory(resolve: Resolve) {
  const logHandler = resolve(KnownToken.Axios.Middleware.Log.handler);

  return (config: CreateAxiosDefaults = {}) => {
    // @todo убрать as any
    const client = create(config as any);

    client.use(HttpStatus.axiosMiddleware());
    client.use(logMiddleware(logHandler));

    return client;
  };
}

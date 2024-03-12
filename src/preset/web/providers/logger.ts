import {
  BrowserClient,
  Hub,
  defaultIntegrations,
  defaultStackParser,
  makeFetchTransport,
} from '@sentry/browser';
import { Resolve } from '../../../di';
import { Logger, createLogger } from '../../../log';
import { KnownToken } from '../../../tokens';
import { createSentryHandler } from '../../../log/handler/sentry';

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

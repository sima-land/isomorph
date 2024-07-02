import {
  Scope,
  BrowserClient,
  getDefaultIntegrations,
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
    dsn: source.require('PUBLIC_SENTRY_DSN'),
    release: source.require('SENTRY_RELEASE'),
    environment: source.require('PUBLIC_SENTRY_ENVIRONMENT'),
    tracesSampleRate: Number(source.get('SENTRY_TRACES_SAMPLE_RATE', 0)),
    profilesSampleRate: Number(source.get('SENTRY_TRACES_SAMPLE_RATE', 0)),
    transport: makeFetchTransport,
    stackParser: defaultStackParser,
    integrations: [...getDefaultIntegrations({})],
  });

  const scope = new Scope();

  scope.setTag('url', window.location.href);
  scope.setClient(client);

  const logger = createLogger();

  logger.subscribe(createSentryHandler(scope));

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

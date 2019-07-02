import Raven from 'raven';

/**
 * Конструктор для создания middleware для Sentry.
 * @param {Object} options Конфигурация.
 * @return {Function} Middleware для Sentry.
 */
export default function createSentryMiddleware (
  {
    config: {
      sentryDsnServer,
      version,
      sentryOptions,
    },
  }
) {
  Raven.config(sentryDsnServer, {
    ...sentryOptions,
    version,
  }).install();

  return Raven.requestHandler();
}

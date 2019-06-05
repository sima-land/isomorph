import Raven from 'raven';


/**
 * Конструктор для создания middleware для Sentty
 * @param {Object} options Конфигурация
 * @return {Function} Middleware для Sentry
 */
export default function createSentryMiddleware (
  {
    config: {
      sentryDsnServer,
      buildVersion: release,
      sentryOptions,
    },
  }
) {
  Raven.config(sentryDsnServer, {
    ...sentryOptions,
    release,
  }).install();

  return Raven.requestHandler();
}

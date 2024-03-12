import { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';

/**
 * Провайдер специфичных параметров, которые frontend-микросервис будет получать в запросе.
 * @param resolve Функция для получения зависимости по токену.
 * @return Параметры.
 */
export function provideSpecificParams(resolve: Resolve): Record<string, unknown> {
  const context = resolve(KnownToken.ExpressHandler.context);

  try {
    const headerValue = context.req.header('simaland-params');

    /**
     * Node.js переводит в ASCII.
     * @see {https://github.com/nodejs/node/issues/17390}
     */
    const processedValue = headerValue ? Buffer.from(headerValue, 'binary').toString('utf8') : '';

    return processedValue ? JSON.parse(processedValue) : {};
  } catch {
    return {};
  }
}

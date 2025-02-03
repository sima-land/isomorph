import { Tracer } from '@opentelemetry/api';
import { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';

/**
 * Провайдер объекта Tracer.
 * @param resolve Функция для получения зависимости по токену.
 * @return Tracer.
 */
export function provideTracer(resolve: Resolve): Tracer {
  const config = resolve(KnownToken.Config.base);
  const provider = resolve(KnownToken.Tracing.provider);

  return provider.getTracer(config.appName, config.appVersion);
}

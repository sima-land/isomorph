import type { Resolve } from '../../../di';
import os from 'node:os';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { KnownToken } from '../../../tokens';

/**
 * Провайдер объекта Resource.
 * @param resolve Функция для получения зависимости по токену.
 * @return Resource.
 */
export function provideTracerProviderResource(resolve: Resolve): Resource {
  const config = resolve(KnownToken.Config.base);

  return new Resource({
    [SemanticResourceAttributes.HOST_NAME]: os.hostname(),
    [SemanticResourceAttributes.SERVICE_NAME]: config.appName,
    [SemanticResourceAttributes.SERVICE_VERSION]: config.appVersion,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: config.env,
  });
}

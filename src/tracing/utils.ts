import type { BaseConfig } from '../config/types';
import { hostname } from 'os';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

/**
 * Возвращает ресурс для BasicTracerProvider, заполненный данными по соглашению.
 * Может быть дополнен с помощью метода merge.
 * @param config Конфиг.
 * @return Ресурс для провайдера.
 */
export function getConventionalResource(config: BaseConfig): Resource {
  return new Resource({
    [SemanticResourceAttributes.HOST_NAME]: hostname(),
    [SemanticResourceAttributes.SERVICE_NAME]: config.appName,
    [SemanticResourceAttributes.SERVICE_VERSION]: config.appVersion,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: config.env,
  });
}

import {
  resourceFromAttributes,
  detectResources,
  defaultResource,
  envDetector,
  hostDetector,
  osDetector,
  processDetector,
  Resource,
} from '@opentelemetry/resources';
import * as SemanticArgs from '@opentelemetry/semantic-conventions/incubating';
import { KnownToken } from '../../../tokens';

import type { Resolve } from '../../../di';

/**
 * Провайдер объекта Resource.
 * @param resolve Функция для получения зависимости по токену.
 * @return Resource.
 */
export function provideTracingResource(resolve: Resolve): Resource {
  const config = resolve(KnownToken.Config.base);

  const resource = defaultResource()
    .merge(
      resourceFromAttributes({
        [SemanticArgs.ATTR_SERVICE_NAME]: config.appName,
        [SemanticArgs.ATTR_SERVICE_VERSION]: config.appVersion,
        [SemanticArgs.ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: config.env,
      }),
    )
    .merge(
      detectResources({
        detectors: [osDetector, envDetector, hostDetector, processDetector],
      }),
    );

  return resource;
}

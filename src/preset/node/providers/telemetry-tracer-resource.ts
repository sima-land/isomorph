import { Resource } from '@opentelemetry/resources';
import * as SemanticArgs from '@opentelemetry/semantic-conventions';
import { KnownToken } from '../../../tokens';

import type { Resolve } from '../../../di';

type SemanticArgKeys = keyof typeof SemanticArgs;
type SemanticArg = Extract<(typeof SemanticArgs)[SemanticArgKeys], string>;

/**
 * Провайдер объекта Resource.
 * @param resolve Функция для получения зависимости по токену.
 * @return Resource.
 */
export function provideTracingResource(resolve: Resolve): Resource {
  const source = resolve(KnownToken.Config.source);
  const otelEnv = Object.entries(source.source).filter(([key]) => key.startsWith('OTEL_RESOURCE_'));
  const result = otelEnv.reduce<Record<string, string>>((acc, [rawKey, value]) => {
    if (value) {
      const key = rawKey.replace(/^OTEL_RESOURCE_/, '') as SemanticArgKeys;
      acc[SemanticArgs[key] as SemanticArg] = value;
    }
    return acc;
  }, {});

  return new Resource(result);
}

import { ConfigSource, createConfigSource } from '../../../config';

/**
 * Провайдер источника конфигурации.
 * @return Источник конфигурации.
 */
export function provideConfigSource(): ConfigSource {
  // ВАЖНО: по умолчанию рассчитываем на process.env который предоставляется сборщиком (например webpack)
  if (typeof process !== 'undefined' && process.env) {
    return createConfigSource(process.env);
  }

  return createConfigSource({});
}

import { createBaseConfig } from '../../../config/base';
import { BaseConfig } from '../../../config/types';
import { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';

/**
 * Провайдер базовой конфигурации приложения.
 * @param resolve Функция для получения зависимости по токену.
 * @return Базовая конфигурация.
 */
export function provideBaseConfig(resolve: Resolve): BaseConfig {
  const source = resolve(KnownToken.Config.source);

  return createBaseConfig(source);
}

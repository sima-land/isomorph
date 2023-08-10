import type { AxiosDefaults, AxiosRequestConfig } from 'axios';

/**
 * Сливает в один объект конфиг и настройки по умолчанию.
 * @param config Конфигурация запроса.
 * @param defaults Настройки по умолчанию для экземпляра axios.
 * @return Уточненная итоговая конфигурация.
 * @todo Было бы круто заменить на axios/core/mergeConfig (https://github.com/axios/axios/blob/v1.x/lib/core/mergeConfig.js).
 */
export function applyAxiosDefaults(
  config: AxiosRequestConfig,
  defaults: AxiosDefaults,
): Omit<AxiosRequestConfig, 'method'> & Pick<Required<AxiosRequestConfig>, 'method'> {
  const { headers: headersDefaults, ...restDefaults } = defaults;
  const method = config.method || defaults.method || 'get';

  return {
    method,
    ...restDefaults,
    ...config,
    headers: {
      ...headersDefaults[method.toLowerCase() as keyof typeof defaults.headers],
      ...config.headers,
    },
  };
}

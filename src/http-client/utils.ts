import type { AxiosDefaults, AxiosRequestConfig } from 'axios';

/**
 * Объединяет значения опций baseURL и url (axios) в одну строку для логирования.
 * @param baseURL Опция baseURL.
 * @param url Опция url.
 * @return Отображение. Не является валидным URL.
 */
export function displayUrl(
  baseURL: AxiosDefaults['baseURL'] = '',
  url: AxiosRequestConfig['url'] = '',
) {
  let result: string;

  switch (true) {
    case Boolean(baseURL && url):
      result = `${baseURL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
      break;
    case Boolean(baseURL) && !url:
      result = baseURL;
      break;
    case !baseURL && Boolean(url):
      result = url;
      break;
    case !baseURL && !url:
    default:
      result = '[empty]';
      break;
  }

  return result;
}

/**
 * Сливает в один объект конфиг и настройки по умолчанию.
 * @param config Конфигурация запроса.
 * @param defaults Настройки по умолчанию для экземпляра axios.
 * @return Уточненная итоговая конфигурация.
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

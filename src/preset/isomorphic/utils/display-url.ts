import type { AxiosRequestConfig } from 'axios';

/**
 * Объединяет значения опций baseURL и url (axios) в одну строку для логирования.
 * @param baseURL Опция baseURL.
 * @param url Опция url.
 * @return Отображение. Не является валидным URL.
 */
export function displayUrl(
  baseURL: AxiosRequestConfig['baseURL'] = '',
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

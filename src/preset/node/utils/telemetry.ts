import { ATTR_HTTP_REQUEST_HEADER } from '@opentelemetry/semantic-conventions';

/**
 * Формирует данные заголовков согласно семантике.
 * @todo Возможно стоит убрать cookie/Cookie.
 * @param headers Объект заголовков запроса.
 * @return Данные заголовков.
 */
export function getSemanticHeaders(headers: Record<string, any>): Record<string, string> | null {
  const result = Object.entries(headers).reduce<Record<string, string>>((acc, [key, value]) => {
    if (value || typeof value === 'number') {
      acc[ATTR_HTTP_REQUEST_HEADER(key)] = value;
    }
    return acc;
  }, {});

  return Object.keys(result).length ? result : null;
}

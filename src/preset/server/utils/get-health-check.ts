import type { Handler } from '../../../http';

/**
 * Возвращает новый обработчик входящих запросов.
 * Обработчик возвращает ответ в формате JSON, тело - объект с полем "uptime" типа number.
 * @return Обработчик.
 */
export function getHealthCheck(): Handler {
  const startTime = Date.now();

  return () =>
    new Response(JSON.stringify({ uptime: Date.now() - startTime }), {
      headers: {
        'content-type': 'application/json',
      },
    });
}

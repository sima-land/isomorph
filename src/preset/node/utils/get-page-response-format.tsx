import type express from 'express';

/**
 * Определит формат ответа.
 * @param req Запрос.
 * @return Формат.
 * @todo Перенести в preset/node (или в preset/server но с именем getPageResponseFormatExpress?).
 * @deprecated Стоит использовать npm:accepts.
 */
export function getPageResponseFormat(req: express.Request): 'html' | 'json' {
  let result: 'html' | 'json' = 'html';

  if ((req.header('accept') || '').toLowerCase().includes('application/json')) {
    result = 'json';
  }

  return result;
}

/**
 * Определяет формат ответа для страницы (html-верстки).
 * Вернет "json" - если заголовок запроса "accept" содержит "application/json".
 * Вернет "html" во всех остальных случаях.
 * @param request Запрос.
 * @return Формат.
 * @deprecated Стоит использовать npm:accepts.
 */
export function getPageResponseFormat(request: Request): 'html' | 'json' {
  let result: 'html' | 'json' = 'html';

  if ((request.headers.get('accept') || '').toLowerCase().includes('application/json')) {
    result = 'json';
  }

  return result;
}

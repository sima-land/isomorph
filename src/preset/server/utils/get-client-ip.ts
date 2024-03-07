/**
 * Вернет строку с IP на основе заголовков запроса.
 * @param request Запрос.
 * @return IP или null.
 */
export function getClientIp(request: Request): string | null {
  const headerValue = request.headers.get('x-client-ip') || request.headers.get('x-forwarded-for');

  return headerValue;
}

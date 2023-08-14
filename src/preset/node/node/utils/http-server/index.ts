import type { Request } from 'express';
import net from 'node:net';

/**
 * Определяет IP входящего запроса.
 * @param request Входящий запрос.
 * @return IP.
 */
export function getClientIp(request: Request): string | undefined {
  const headerValue =
    request.get('x-client-ip') ||
    request.get('x-forwarded-for') ||
    request.socket.remoteAddress ||
    '';

  return net.isIP(headerValue) ? headerValue : undefined;
}

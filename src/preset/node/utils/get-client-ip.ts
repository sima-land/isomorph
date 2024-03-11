import type express from 'express';
import net from 'node:net';

/**
 * Определяет IP входящего запроса.
 * @param request Входящий запрос.
 * @return IP.
 */
export function getClientIp(request: express.Request): string | undefined {
  const headerValue =
    request.header('x-client-ip') ||
    request.header('x-forwarded-for') ||
    request.socket.remoteAddress ||
    '';

  return net.isIP(headerValue) ? headerValue : undefined;
}

import type { Request, Response } from 'express';
import type { ConventionalJson, PageAssets } from './types';
import { isIP } from 'net';

/**
 * Определяет IP входящего запроса.
 * @param req Входящий запрос.
 * @return IP.
 */
export function getXClientIp(req: Request): string {
  const headerValue =
    req.get('x-client-ip') || req.get('x-forwarded-for') || req.socket.remoteAddress || '';

  return isIP(headerValue) ? headerValue : '';
}

/**
 * Определяет служебные заголовки по соглашению.
 * @param req Входящий запрос.
 * @return Служебные заголовки.
 */
export function getServiceHeaders(req: Request): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};

  for (const [key] of Object.entries(req.headers)) {
    if (key.toLowerCase().indexOf('simaland-') === 0) {
      result[key] = req.header(key);
    }
  }

  return result;
}

/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
export class PageResponse {
  private type: 'html' | 'json';
  private html: string;
  private assets: PageAssets;

  static create() {
    return new PageResponse();
  }

  static defineFormat(req: Request): PageResponse['type'] {
    let result: PageResponse['type'] = 'html';

    if ((req.header('accept') || '').toLowerCase().includes('application/json')) {
      result = 'json';
    }

    return result;
  }

  constructor() {
    this.type = 'html';
    this.html = '';
    this.assets = { js: '', css: '' };
  }

  markup(html: string) {
    this.html = html;
    return this;
  }

  script(url: string) {
    this.assets.js = url;
    return this;
  }

  style(url: string) {
    this.assets.css = url;
    return this;
  }

  format(type: PageResponse['type']) {
    this.type = type;
    return this;
  }

  send(res: Response) {
    switch (this.type) {
      case 'json': {
        const result: ConventionalJson = {
          markup: this.html,
          bundle_js: this.assets.js,
          bundle_css: this.assets.css,
        };

        res.json(result);
        break;
      }
      case 'html': {
        res.setHeader('simaland-bundle-js', this.assets.js);
        res.setHeader('simaland-bundle-css', this.assets.css);

        // @todo dev-шаблон?
        res.send(this.html);
        break;
      }
      default:
        throw Error(`Unknown response format ${String(this.type)}`);
    }
  }
}
/* eslint-enable require-jsdoc, jsdoc/require-jsdoc */

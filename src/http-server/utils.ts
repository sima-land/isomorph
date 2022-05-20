import type { Request, Response } from 'express';
import type { ConventionalJson, PageAssets, PageTemplate, PageTemplateData } from './types';
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
  private _template: PageTemplate;

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

  static defaultTemplate({ markup }: PageTemplateData) {
    return markup;
  }

  constructor() {
    this.type = 'html';
    this.html = '';
    this.assets = { js: '', css: '' };
    this._template = PageResponse.defaultTemplate;
  }

  markup(html: string) {
    this.html = html;
    return this;
  }

  script(url: string) {
    this.assets.js = url;
    return this;
  }

  styles(url: string) {
    this.assets.css = url;
    return this;
  }

  format(type: PageResponse['type']) {
    this.type = type;
    return this;
  }

  template(template: PageTemplate) {
    this._template = template;
    return this;
  }

  send(res: Response) {
    const templateData: PageTemplateData = {
      type: this.type,
      markup: this.html,
      assets: this.assets,
    };

    switch (this.type) {
      case 'json': {
        const result: ConventionalJson = {
          markup: this._template(templateData),
          bundle_js: this.assets.js,
          bundle_css: this.assets.css,
        };

        res.json(result);
        break;
      }
      case 'html': {
        res.setHeader('simaland-bundle-js', this.assets.js);
        res.setHeader('simaland-bundle-css', this.assets.css);

        res.send(this._template(templateData));
        break;
      }
      default:
        throw Error(`Unknown response format ${String(this.type)}`);
    }
  }
}
/* eslint-enable require-jsdoc, jsdoc/require-jsdoc */

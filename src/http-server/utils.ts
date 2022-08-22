import type { Request, Response } from 'express';
import type { ConventionalJson, PageAssets, PageTemplate, PageTemplateData } from './types';
import type { BaseConfig } from '../config/types';
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

/**
 * Формирует заголовки для исходящих запросов с сервера по соглашению.
 * @param config Конфиг.
 * @param request Входящий запрос.
 * @return Заголовки для исходящих запросов.
 */
export function getRequestHeaders(config: BaseConfig, request: Request): Record<string, string> {
  return {
    'X-Client-Ip': getXClientIp(request),
    'User-Agent': `simaland-${config.appName}/${config.appVersion}`,
    Cookie: request.get('cookie') || '',
    ...getServiceHeaders(request),
  };
}

/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
export class PageResponse {
  private type: 'html' | 'json';
  private html: string;
  private _assets: PageAssets;
  private _template: PageTemplate;

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
    this._assets = { js: '', css: '' };
    this._template = PageResponse.defaultTemplate;
  }

  markup(html: string) {
    this.html = html;
    return this;
  }

  assets(assets: PageAssets) {
    this._assets = assets;
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
      assets: this._assets,
    };

    switch (this.type) {
      case 'json': {
        const result: ConventionalJson = {
          markup: this._template(templateData),
          bundle_js: this._assets.js,
          bundle_css: this._assets.css,
          critical_js: this._assets.criticalJs,
          critical_css: this._assets.criticalCss,
        };

        res.json(result);
        break;
      }
      case 'html': {
        res.setHeader('simaland-bundle-js', this._assets.js);
        res.setHeader('simaland-bundle-css', this._assets.css);

        if (this._assets.criticalJs) {
          res.setHeader('simaland-critical-js', this._assets.criticalJs);
        }

        if (this._assets.criticalCss) {
          res.setHeader('simaland-critical-css', this._assets.criticalCss);
        }

        res.send(this._template(templateData));
        break;
      }
      default:
        throw Error(`Unknown response format ${String(this.type)}`);
    }
  }
}
/* eslint-enable require-jsdoc, jsdoc/require-jsdoc */

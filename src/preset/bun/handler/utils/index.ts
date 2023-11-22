/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import type { Handler } from '../../../../http';
import type { BaseConfig } from '../../../../config';
import { KnownToken } from '../../../../tokens';
import { CURRENT_APP, type Application, type Resolve } from '../../../../di';
import { getClientIp } from '../../bun/utils';

export function HandlerProvider(getApp: () => Application) {
  return (resolve: Resolve): Handler => {
    const parent = resolve(CURRENT_APP);

    return request => {
      const app = getApp();

      app.attach(parent);
      app.bind(KnownToken.Http.Handler.context).toValue({ request });

      return app.get(KnownToken.Http.Handler.main)(request);
    };
  };
}

export function getResponseFormat(request: Request): 'html' | 'json' {
  let result: 'html' | 'json' = 'html';

  if ((request.headers.get('accept') || '').toLowerCase().includes('application/json')) {
    result = 'json';
  }

  return result;
}

export function getForwardedHeaders(config: BaseConfig, request: Request): Headers {
  const result = new Headers();

  // user agent
  result.set('User-Agent', `simaland-${config.appName}/${config.appVersion}`);

  // client ip
  const clientIp = getClientIp(request);

  if (clientIp) {
    result.set('X-Client-Ip', clientIp);
  }

  // service headers
  request.headers.forEach((headerValue, headerName) => {
    if (
      headerName.toLowerCase().startsWith('simaland-') &&
      headerName.toLowerCase() !== 'simaland-params'
    ) {
      result.set(headerName, headerValue);
    }
  });

  return result;
}

import type express from 'express';
import { KnownToken } from '../../../tokens';
import { CURRENT_APP, type Application, type Provider, type Resolve } from '../../../di';

/**
 * Возвращает express-handler, создающий дочернее di-приложение при запросе.
 * @param getApp Должна вернуть di-приложения запроса.
 * @return Обработчик.
 */
export function HandlerProvider(getApp: () => Application): Provider<express.Handler> {
  return (resolve: Resolve): express.Handler => {
    const parent = resolve(CURRENT_APP);

    return (req, res, next) => {
      const app = getApp();

      app.attach(parent);
      app.bind(KnownToken.ExpressHandler.context).toValue({ req, res, next });
      app.get(KnownToken.ExpressHandler.main)(req, res, next);
    };
  };
}

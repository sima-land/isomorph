/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import type { Handler } from '../../../http';
import type { ServerHandler } from '../../server/types';
import { KnownToken } from '../../../tokens';
import { CURRENT_APP, type Application, type Resolve, Provider } from '../../../di';

export function HandlerProvider(getApp: () => Application): Provider<ServerHandler> {
  return (resolve: Resolve): ServerHandler => {
    const parent = resolve(CURRENT_APP);

    return (request, context) => {
      const app = getApp();

      app.attach(parent);
      app.bind(KnownToken.Http.Handler.context).toValue({ request, ...context });

      return app.get(KnownToken.Http.Handler.main)(request, context);
    };
  };
}

// ВАЖНО: временная экспериментальная утилита, скорее всего будет удалена в будущем
export function statsHandler(): Handler {
  /** @inheritdoc */
  const getHeapStats = async () => {
    const jsc = await import(
      /* webpackIgnore: true */
      `bun:jsc`
    );

    return jsc.heapStats();
  };

  return async () => {
    const stats = await getHeapStats();

    return new Response(JSON.stringify(stats, null, 2), {
      headers: { 'content-type': 'application/json' },
    });
  };
}

/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import { Handler, proxy } from '../../../http';
import { router, applyMiddleware } from '@krutoo/fetch-tools';
import { applyServerMiddleware } from '../utils/apply-server-middleware';

export function provideServe(resolve: Resolve): Handler {
  const config = resolve(KnownToken.Config.base);
  const pageRoutes = resolve(KnownToken.Http.Serve.pageRoutes);
  const serviceRoutes = resolve(KnownToken.Http.Serve.serviceRoutes);
  const middleware = resolve(KnownToken.Http.Serve.middleware);
  const proxyConfig = resolve(KnownToken.Http.Serve.Proxy.config);

  const enhance =
    config.env === 'development' && proxyConfig
      ? applyMiddleware(
          ...(Array.isArray(proxyConfig) ? proxyConfig.map(proxy) : [proxy(proxyConfig)]),
        )
      : identity;

  const builder = router.builder();

  // маршруты с промежуточными слоями
  for (const [pattern, handler] of pageRoutes) {
    const path = typeof pattern === 'string' ? pattern : pattern.path;
    const method = typeof pattern === 'string' ? 'get' : pattern.method;
    const pageHandler = applyServerMiddleware(...middleware)(handler);

    builder[method](path, request => pageHandler(request, { events: new EventTarget() }));
  }

  // служебные маршруты (к ним не применяются промежуточные слои)
  for (const [pattern, handler] of serviceRoutes) {
    const path = typeof pattern === 'string' ? pattern : pattern.path;
    const method = typeof pattern === 'string' ? 'get' : pattern.method;

    builder[method](path, request => handler(request, { events: new EventTarget() }));
  }

  // @todo также добавить apiRoutes?
  return enhance(builder.build());
}

function identity<T>(value: T): T {
  return value;
}

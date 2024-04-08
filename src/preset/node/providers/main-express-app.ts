import type { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

/**
 * Провайдер основного express-приложения.
 * @param resolve Функция для получения зависимости по токену.
 * @return Основное express-приложение.
 */
export function provideMainExpressApp(resolve: Resolve): express.Application {
  const config = resolve(KnownToken.Config.base);
  const pageRoutes = resolve(KnownToken.Express.pageRoutes);
  const serviceRoutes = resolve(KnownToken.Express.serviceRoutes);
  const middleware = resolve(KnownToken.Express.middleware);
  const endMiddleware = resolve(KnownToken.Express.endMiddleware);
  const proxyConfig = resolve(KnownToken.Http.Serve.Proxy.config);

  const app = express();

  if (config.env === 'development' && proxyConfig) {
    const proxyConfigs = Array.isArray(proxyConfig) ? proxyConfig : [proxyConfig];

    for (const { target, filter } of proxyConfigs) {
      // ВАЖНО: так как не можем предоставить web-интерфейс Request бросаем ошибку
      if (typeof filter === 'function') {
        throw new Error('Currently function is not supported for proxy "filter"');
      }

      const proxyPaths = Array.isArray(filter) ? filter : [filter];

      app.use(
        createProxyMiddleware({
          target,
          changeOrigin: true,
          pathFilter: inputPath => proxyPaths.some(proxyPath => inputPath.startsWith(proxyPath)),
        }),
      );
    }
  }

  // маршруты страниц
  for (const [routePath, routeHandler] of pageRoutes) {
    const path = typeof routePath === 'string' ? routePath : routePath.path;
    const method = typeof routePath === 'string' ? 'get' : routePath.method;

    app.use(path, middleware);
    app[method](path, routeHandler);
    app.use(path, endMiddleware);
  }

  // служебные маршруты (к ним не применяются промежуточные слои)
  for (const [routePath, routeHandler] of serviceRoutes) {
    const path = typeof routePath === 'string' ? routePath : routePath.path;
    const method = typeof routePath === 'string' ? 'get' : routePath.method;

    app[method](path, routeHandler);
  }

  // @todo также добавить apiRoutes?
  return app;
}

import express from 'express';
import type { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';

/**
 * Провайдер основного express-приложения.
 * @param resolve Функция для получения зависимости по токену.
 * @return Основное express-приложение.
 */
export function provideMainExpressApp(resolve: Resolve): express.Application {
  const pageRoutes = resolve(KnownToken.Express.pageRoutes);
  const serviceRoutes = resolve(KnownToken.Express.serviceRoutes);
  const middleware = resolve(KnownToken.Express.middleware);
  const endMiddleware = resolve(KnownToken.Express.endMiddleware);

  const app = express();

  // маршруты страниц
  for (const [routePath, routeHandler] of pageRoutes) {
    app.use(routePath, middleware);
    app.get(routePath, routeHandler);
    app.use(routePath, endMiddleware);
  }

  // служебные маршруты (к ним не применяются промежуточные слои)
  for (const [routePath, routeHandler] of serviceRoutes) {
    app.get(routePath, routeHandler);
  }

  return app;
}

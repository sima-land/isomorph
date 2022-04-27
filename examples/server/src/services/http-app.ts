import type { Application, Handler } from 'express';
import type { DefaultMiddleware } from '@sima-land/isomorph/http-server/types';
import { healthCheck } from '@sima-land/isomorph/http-server/handler/health-check';

export function createMainServer({
  createServer,
  handler,
  middleware,
}: {
  handler: { desktop: Handler; mobile: Handler };
  middleware: DefaultMiddleware;
  createServer: () => Application;
}): Application {
  const app = createServer();

  app.use(
    ['/', '/desktop', '/mobile'],
    [
      ...middleware.start,
      ...middleware.logging,
      ...middleware.metrics,
      ...middleware.tracing,
      ...middleware.finish,
    ],
  );

  app.get(['/', '/desktop'], handler.desktop);
  app.get(['/mobile'], handler.mobile);
  app.get('/healthcheck', healthCheck());

  return app;
}

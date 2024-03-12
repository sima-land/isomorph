/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import { Handler } from '../../../http';
import { route, router } from '@krutoo/fetch-tools';
import { applyServerMiddleware } from '../../server/utils/apply-server-middleware';

export function provideServe(resolve: Resolve): Handler {
  const middleware = resolve(KnownToken.Http.Serve.middleware);
  const routes = resolve(KnownToken.Http.Serve.routes);
  const serviceRoutes = resolve(KnownToken.Http.Serve.serviceRoutes);

  const enhance = applyServerMiddleware(...middleware);

  return router(
    // маршруты с промежуточными слоями
    ...routes.map(([pattern, handler]) => {
      const enhancedHandler = enhance(handler);

      return route.get(pattern, request => enhancedHandler(request, { events: new EventTarget() }));
    }),

    // @todo вместо routes обрабатывать pageRoutes с помощью route.get() из новой версии fetch-tools (для явности)
    // @todo также добавить apiRoutes и обрабатывать их с помощью с помощью route()?

    // служебные маршруты (без промежуточных слоев)
    ...serviceRoutes.map(([pattern, handler]) =>
      route(pattern, request => handler(request, { events: new EventTarget() })),
    ),
  );
}

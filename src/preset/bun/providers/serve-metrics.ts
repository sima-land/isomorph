/* eslint-disable jsdoc/require-jsdoc */
import { Handler } from '../../../http';
import { route, router } from '@krutoo/fetch-tools';
import PromClient from 'prom-client';

export function provideServeMetrics(): Handler {
  // @todo задействовать когда Bun реализует pref_hooks.monitorEventLoopDelay (https://github.com/siimon/prom-client/issues/570)
  // PromClient.collectDefaultMetrics();

  return router(
    route.get('/', async () => {
      const metrics = await PromClient.register.metrics();
      const headers = new Headers();

      headers.set('Content-Type', PromClient.register.contentType);

      return new Response(metrics, { headers });
    }),
  );
}

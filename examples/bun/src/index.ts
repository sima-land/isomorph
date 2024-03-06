import { MainApp } from './app';
import { TOKEN } from './tokens';

MainApp().invoke(
  [TOKEN.Lib.Config.source, TOKEN.Lib.logger, TOKEN.Lib.Http.serve, TOKEN.Lib.Metrics.httpHandler],
  (config, logger, serve, serveMetrics) => {
    const server = Bun.serve({
      port: config.require('HTTP_PORT_MAIN'),
      fetch: serve,
    });

    logger.info(`Server started on ${server.url}`);

    const metricsServer = Bun.serve({
      port: config.require('HTTP_PORT_METRICS'),
      fetch: serveMetrics,
    });

    logger.info(`Metrics server started on ${metricsServer.url}`);
  },
);

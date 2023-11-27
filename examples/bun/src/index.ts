import { MainApp } from './app';
import { TOKEN } from './tokens';

MainApp().invoke(
  [TOKEN.Lib.Config.source, TOKEN.Lib.logger, TOKEN.Lib.Http.serve],
  (config, logger, serve) => {
    const server = Bun.serve({
      port: config.require('MAIN_HTTP_PORT'),
      fetch: serve,
    });

    logger.info(`Server started on ${server.url}`);
  },
);

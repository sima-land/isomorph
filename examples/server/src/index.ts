import { MainApp } from './di/apps/main';
import { TOKEN } from './di/tokens';

MainApp().invoke(
  [TOKEN.appConfig, TOKEN.Known.logger, TOKEN.httpServer],
  (config, logger, server) => {
    server.listen(config.http.ports.main, () => {
      logger.info(`Server started on port ${config.http.ports.main}`);
    });
  },
);

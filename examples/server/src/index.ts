import { MainApp } from './app';
import { TOKEN } from './tokens';

MainApp().invoke(
  [TOKEN.Project.config, TOKEN.Lib.logger, TOKEN.Project.Http.server, TOKEN.Lib.Metrics.httpApp],
  (config, logger, mainServer, metricsServer) => {
    mainServer.listen(config.http.ports.main, () => {
      logger.info(`Server started on port ${config.http.ports.main}`);
    });

    metricsServer.listen(config.http.ports.metrics, () => {
      logger.info(`Metrics app started on port ${config.http.ports.metrics}`);
    });
  },
);
